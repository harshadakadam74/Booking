const generateProductSku = (title, brand) => {
    const t = title.substring(0, 4).toupperCase();
    const b = brand.substring(0, 4).toupperCase();
    const rand = Math.floor(10000 + Math.random() * 90000);
    return  `PRE-${b}-${t}-${rand}`;
};

const generateSkuCode = (productSku, weight) => {
    return `${productSku}-${weight.toupperCase()}`;
};

module.exports = {generateProductSku, generateSkuCode}