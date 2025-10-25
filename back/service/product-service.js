const puppeteer = require('puppeteer');
const ProductListModel = require('../models/productList-model');
const mongoose = require('mongoose');

class ProductService {
    getMarketplace(url) {
        const domain = new URL(url).hostname;
        const marketplaces = {
            'quke.ru': 'quke',
        };

        return marketplaces[domain] || null;
    }

    async parseQukeProducts(url) {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        const page = await browser.newPage();

        await page.setRequestInterception(true);
        page.on('request', (request) => {
            if (request.resourceType() === 'image' || request.resourceType() === 'media') {
                request.abort();
            } else {
                request.continue();
            }
        });

        await page.goto(url, { waitUntil: 'networkidle2' });

        let products = [];

        try {
            while (true) {
                console.log(`Парсинг страницы: ${page.url()}`); 

                const pageProducts = await page.evaluate(() => {
                    const items = Array.from(document.querySelectorAll('.b-card2-v2__inner'));
                    return items.map(item => {
                        const linkElement = item.querySelector('.b-card2-v2__img-link');
                        const imageElement = item.querySelector('.b-card2-v2__img');
                        const titleElement = item.querySelector('.b-card2-v2__name');
                        const ratingElement = item.querySelector('.b-rating__stars-selected');
                        const ratingCountElement = item.querySelector('.b-card2-v2__rating-link');
                        const statusElement = item.querySelector('.b-card2-v2__status-text');
                        const oldPriceElement = item.querySelector('.b-card2-v2__old-price');
                        const currentPriceElement = item.querySelector('.b-card2-v2__price-val');
                        const currencyElement = item.querySelector('.b-card2-v2__price-cur');
                        const bonusElement = item.querySelector('.q-bonus__badge-amount');
                        const marketplaceElement = item.querySelector('.marketplace-selector'); 

                        return {
                            link: linkElement ? linkElement.href : null,
                            image: imageElement ? imageElement.getAttribute('data-src') || imageElement.getAttribute('src') : null,
                            title: titleElement ? titleElement.textContent.trim() : null,
                            rating: ratingElement ? ratingElement.getAttribute('style') : null,
                            ratingCount: ratingCountElement ? ratingCountElement.textContent.trim() : null,
                            status: statusElement ? statusElement.textContent.trim() : null,
                            oldPrice: oldPriceElement ? oldPriceElement.textContent.trim() : null,
                            currentPrice: currentPriceElement ? currentPriceElement.textContent.trim() : 'отсутствует',
                            currency: currencyElement ? currencyElement.textContent.trim() : null,
                            bonus: bonusElement ? bonusElement.textContent.trim() : null,
                            marketplace: marketplaceElement ? marketplaceElement.textContent.trim() : null
                        };
                    });
                });

                const marketplace = this.getMarketplace(url);
                const updatedProducts = pageProducts.map(product => {
                    return {
                        ...product,
                        marketplace: product.marketplace || marketplace || 'неизвестный'
                    };
                });

                products = products.concat(updatedProducts);

                const nextButton = await page.$('.pagination2__btn--next');
                if (!nextButton) {
                    break;
                }

                await nextButton.click();

                await page.waitForNavigation({ waitUntil: 'networkidle2' });
            }
        } catch (error) {
            console.error('Error parsing quke products with Puppeteer:', error);
        } finally {
            await browser.close();
        }

        return products;
    }

    // Общий метод для парсинга товаров
    async parseProducts(url) {
        const marketplace = this.getMarketplace(url);
        if (!marketplace) {
            throw new Error('Маркетплейс не поддерживается');
        }
        let products;
        switch (marketplace) {
            case 'quke':
                products = await this.parseQukeProducts(url);
                break;
            default:
                throw new Error('Маркетплейс не поддерживается');
        }
        const count = products.length;
        return { products, count };
    }

    async saveProductList(products, userId, marketplace) {
        try {
            const count = products.length;
    
            const productList = new ProductListModel({
                user: new mongoose.Types.ObjectId(userId),
                marketplace: marketplace,
                count: count, 
                products: products.map(product => ({
                    title: product.title,
                    price: product.currentPrice,
                    link: product.link,
                    image: product.image,
                    createdAt: product.createdAt || new Date()
                }))
            });
    
            for (const product of productList.products) {
                const existingProduct = await ProductListModel.findOne({
                    user: userId,
                    'products.link': product.link
                });
    
                if (existingProduct) {
                    await ProductListModel.updateOne(
                        { user: userId, 'products.link': product.link },
                        {
                            $set: {
                                'products.$.title': product.title,
                                'products.$.price': product.price,
                                'products.$.image': product.image,
                                'products.$.createdAt': product.createdAt
                            }
                        }
                    );
                } else {
                    await productList.save();
                }
            }
            return productList;
        } catch (error) {
            console.error('Error saving product list:', error);
            throw error;
        }
    }
    

    async getSavedProductList(userId, url) {
        try {
            const productList = await ProductListModel.findOne({ user: userId, 'products.link': url });
            
            if (productList) {
                return {
                    user: productList.user,
                    marketplace: productList.marketplace,
                    count: productList.products.length,
                    products: productList.products,
                    createdAt: productList.createdAt
                };
            }
    
            return null;
        } catch (error) {
            console.error('Error fetching saved product list:', error);
            throw error;
        }
    }
    

    async getUserProducts(userId) {
        try {
            return await ProductListModel.find({ user: userId }).select('-user')
        } catch (error) {
            console.error('Error fetching user products:', error);
            throw error;
        }
    }
    
}

module.exports = new ProductService();