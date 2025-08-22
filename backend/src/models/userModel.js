// src/models/userModel.js

const db = require('../config/db');

/**
 * Finds a user by their email address.
 * @param {string} email - The email of the user to find.
 * @returns {Promise<object|undefined>} The user object or undefined if not found.
 */
const findUserByEmail = async (email) => {
    // MySQL uses '?' as placeholders instead of '$1', '$2', etc.
    const query = `
        SELECT u.user_id, u.email, u.password_hash, r.role_name 
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
        WHERE u.email = ?
    `;
    // The mysql2 library returns an array where the first element is the rows.
    const [rows] = await db.query(query, [email]);
    return rows[0];
};

/**
 * Creates a new user and their profile within a transaction.
 * @param {string} email
 * @param {string} passwordHash
 * @param {string} role - The role name ('admin', 'teacher', 'student').
 * @param {object} profile - User profile data.
 * @returns {Promise<object>} The newly created user's basic info.
 */
const createUser = async (email, passwordHash, role, profile) => {
    // Get a connection from the pool for transaction
    const connection = await db.getConnection();
    try {
        // Start the transaction
        await connection.beginTransaction();

        // Get role_id from role_name
        const [roleResult] = await connection.query('SELECT role_id FROM roles WHERE role_name = ?', [role]);
        if (roleResult.length === 0) {
            throw new Error('Invalid role specified');
        }
        const roleId = roleResult[0].role_id;

        // Insert into users table
        const userQuery = 'INSERT INTO users (email, password_hash, role_id) VALUES (?, ?, ?)';
        // The result object contains metadata, including the insertId for AUTO_INCREMENT columns
        const [userResult] = await connection.query(userQuery, [email, passwordHash, roleId]);
        const newUserId = userResult.insertId;

        // Insert into user_profiles table
        const { firstName, lastName, dateOfBirth, contactNumber, address } = profile;
        const profileQuery = `
            INSERT INTO user_profiles (user_id, first_name, last_name, date_of_birth, contact_number, address)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        await connection.query(profileQuery, [newUserId, firstName, lastName, dateOfBirth, contactNumber, address]);

        // If all queries were successful, commit the transaction
        await connection.commit();

        return { user_id: newUserId, email, role };

    } catch (error) {
        // If any query fails, roll back the entire transaction
        await connection.rollback();
        // Re-throw the error to be handled by the controller
        throw error;
    } finally {
        // VERY IMPORTANT: Always release the connection back to the pool
        connection.release();
    }
};

/**
 * Fetches all users with their profile and role.
 * @returns {Promise<Array<object>>} A list of all users.
 */
const findAllUsers = async () => {
    const query = `
        SELECT u.user_id, p.first_name, p.last_name, u.email, r.role_name
        FROM users u
        JOIN user_profiles p ON u.user_id = p.user_id
        JOIN roles r ON u.role_id = r.role_id
        ORDER BY p.last_name, p.first_name;
    `;
    const [rows] = await db.query(query);
    return rows;
};

module.exports = {
    findUserByEmail,
    createUser,
    findAllUsers,
};
