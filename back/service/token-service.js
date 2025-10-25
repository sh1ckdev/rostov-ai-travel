const jwt = require('jsonwebtoken');
const tokenModel = require('../models/token-model');

class TokenService {
    generateTokens(payload) {
        const accessSecret = process.env.JWT_ACCESS_SECRET || 'default-access-secret-key';
        const refreshSecret = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-key';
        
        if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
            console.warn('JWT secrets not set, using default values. This is not secure for production!');
        }
        
        const accessToken = jwt.sign(payload, accessSecret, {expiresIn: '15h'})
        const refreshToken = jwt.sign(payload, refreshSecret, {expiresIn: '30h'})
        return {
            accessToken,
            refreshToken
        }
    }

    validateAccessToken(token) {
        try {
            const accessSecret = process.env.JWT_ACCESS_SECRET || 'default-access-secret-key';
            const userData = jwt.verify(token, accessSecret);
            return userData;
        } catch (e) {
            console.error('Ошибка валидации accessToken: ', e);
            return null;
        }
    }

    async validateRefreshToken(token) {
        try {
            const refreshSecret = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-key';
            const userData = jwt.verify(token, refreshSecret);
            return userData;
        } catch (e) {
            console.error('Ошибка валидации refreshToken: ', e);
            return null;
        }
    }
    

    async saveToken(userId, refreshToken) {
        const tokenData = await tokenModel.findOne({ user: userId });
        if (tokenData) {
            tokenData.refreshToken = refreshToken;
            await tokenData.save();
        } else {
            await tokenModel.create({ user: userId, refreshToken: refreshToken });
        }
    }

    async removeToken(refreshToken) {
        const tokenData = await tokenModel.deleteOne({ refreshToken });
        return tokenData;
    }

    async findToken(refreshToken) {
        const tokenData = await tokenModel.findOne({ refreshToken });
        return tokenData;
    }
    
}

module.exports = new TokenService();
