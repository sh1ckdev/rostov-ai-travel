const UserModel = require('../models/user-modal');
const bcrypt = require('bcrypt');
const tokenService = require('./token-service');
const UserDto = require('../dtos/user-dto');
const ApiError = require('../exceptions/api-error'); 

class UserService {
    async registration(username, email, password) {
        const candidate = await UserModel.findOne({ username, email });
        if (candidate) {
            throw ApiError.BadRequest('Пользователь уже существует');
        }
        const hashedPassword = await bcrypt.hash(password, 3);
        const user = await UserModel.create({ username, email, password: hashedPassword });

        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({ ...userDto });
        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        return {
            ...tokens,
            user: userDto
        };
    }
    async login(username, password) {
        const user = await UserModel.findOne({ username });
        if (!user) {
            throw ApiError.BadRequest('Пользователь с таким никнеймом не найден');
        }
        const isPassEquals = await bcrypt.compare(password, user.password);
        if (!isPassEquals) {
            throw ApiError.BadRequest('Неверный пароль');
        }
    
        let isAdmin = false;
        if (user.username === "admin") {
            isAdmin = true;
        }
    
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({ ...userDto });
        await tokenService.saveToken(userDto.id, tokens.refreshToken);
    
        return {
            ...tokens,
            user: userDto,
            isAdmin: isAdmin
        };
    }


    async logout(refreshToken){
        const token = await tokenService.removeToken(refreshToken)
        return token
    }
async refresh(refreshToken) {

    if (!refreshToken) {
        throw ApiError.UnauthorizedError();
    }

    const userData = await tokenService.validateRefreshToken(refreshToken);
    const tokenFromDb = await tokenService.findToken(refreshToken);

    if (!userData || !tokenFromDb) {
        throw ApiError.UnauthorizedError();
    }

    const user = await UserModel.findById(userData.id);
    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });

    await tokenService.saveToken(userDto.id, tokens.refreshToken);
    return { ...tokens, user: userDto };
}

    async updateProfile(fieldsToUpdate, userId) {
        try {
            const currentUser = await UserModel.findById(userId);
    
            if (!currentUser) {
                throw ApiError.NotFound('Пользователь не найден');
            }
    
            const { username, password, email } = fieldsToUpdate;
            const updatedFields = {
                username: (username && username.trim()) || currentUser.username,
                email: (email && email.trim()) || currentUser.email,
                password: (password && password.trim()) || currentUser.password,
            };
            

            const newUsername = updatedFields.username;
    
            if (newUsername && newUsername !== currentUser.username) {
                const existingUser = await UserModel.findOne({ username: newUsername });
    
                if (existingUser) {
                    throw ApiError.BadRequest('Никнейм уже используется');
                }
            }

            if (password) {
                const hashedPassword = await bcrypt.hash(password, 3); 
                updatedFields.password = hashedPassword;
            }
    
            Object.assign(currentUser, updatedFields);
    
            await currentUser.save();
    
            const userDto = new UserDto(currentUser);
            return userDto 
        } catch (error) {
            throw error;
        }
    }  

    async deleteUser(userId) {
        try {
            const deletedUser = await UserModel.findByIdAndDelete(userId);
            return deletedUser;
        } catch (error) {
            
        }
    }

    async getUser(username){
        try {
            const user = await UserModel.findOne({username}).select("-password -email -refreshToken");
            console.log(user)
            return user;
        } catch(error) {

        }
    }
}

module.exports = new UserService();
