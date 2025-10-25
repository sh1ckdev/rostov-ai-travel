const UserService = require("../service/user-service");
const { validationResult } = require("express-validator");
const ApiError = require("../exceptions/api-error");
const userService = require("../service/user-service");
const UserModel = require("../models/user-modal");

class UserController {
    async registration(req, res, next) {
        try {
            console.log('Registration request received:', req.body);
            
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                console.log('Validation errors:', errors.array());
                return next(ApiError.BadRequest("Ошибка валидации", errors.array()));
            }
            
            const { username, email, password } = req.body;
            
            // Дополнительная валидация
            if (!username || !email || !password) {
                console.log('Missing required fields:', { username, email, password: !!password });
                return res.status(400).json({
                    error: 'Missing required fields',
                    message: 'Username, email, and password are required'
                });
            }
            
            console.log('Calling UserService.registration...');
            const userData = await UserService.registration(
                username,
                email,
                password
            );
            console.log('Registration successful:', { username: userData.user.username, email: userData.user.email });

            res.cookie("refreshToken", userData.refreshToken, {
                maxAge: 30 * 24 * 60 * 60 * 1000,
                httpOnly: true,
            });

            return res.json(userData);
        } catch (error) {
            console.error('Registration error:', error);
            next(error);
        }
    }
    async login(req, res, next) {
        try {
            const { username, password } = req.body;
            
            // Валидация входных данных
            if (!username || !password) {
                return res.status(400).json({
                    error: 'Missing required fields',
                    message: 'Username and password are required'
                });
            }
            
            const userData = await UserService.login(username, password);
            res.cookie("refreshToken", userData.refreshToken, {
                maxAge: 30 * 24 * 60 * 60 * 1000,
                httpOnly: true,
            });

            return res.json(userData);
        } catch (error) {
            console.error('Registration error:', error);
            next(error);
        }
    }
    async logout(req, res, next) {
        try {
            const { refreshToken } = req.cookies;
            const token = await userService.logout(refreshToken);
            res.clearCookie("refreshToken");
            return res.json(token);
        } catch (error) {
            console.error('Registration error:', error);
            next(error);
        }
    }
    async refresh(req, res, next) {
        try {
            const { refreshToken } = req.cookies;
            console.log(refreshToken);
            const userData = await userService.refresh(refreshToken);
            res.cookie("refreshToken", userData.refreshToken, {
                maxAge: 30 * 24 * 60 * 60 * 1000,
                httpOnly: true,
            });
            return res.json(userData);
        } catch (error) {
            console.error('Error during refresh:', error);
            next(error);
        }
    }
    
    async getUsers(req, res, next) {
        try {
            const users = await UserModel.find({});
            res.json(users);
        } catch (error) {
            console.error('Registration error:', error);
            next(error);
        }
    }
    

    async updateProfile(req, res, next) {
        try {
            const { fieldsToUpdate } = req.body;
            const { userId } = req.params;
            const updatedUser = await userService.updateProfile(
                fieldsToUpdate,
                userId
            );

            return res.json({
                message: "Profile updated successfully",
                user: updatedUser,
            });
        } catch (error) {
            console.error('Registration error:', error);
            next(error);
        }
    }

    // async deleteUser(req, res, next) {
    //     try {
    //         const { userId } = req.params;
    //         await userService.deleteUser(userId)
    //         return res.json({
    //             message: "Пользователь удален",
    //         });
    //     } catch (error) {
            
    //     }
    // }
    async getUser(req, res, next) {
        try {
            const { username } = req.params;
            const user = await userService.getUser(username)
            
            if (!user) {
                return res.status(404).json({ message: "Пользователь не найден" });
            }
    
            return res.json(user);
        } catch (error) {
            console.error('Registration error:', error);
            next(error);
        }
    }
}

module.exports = new UserController();
