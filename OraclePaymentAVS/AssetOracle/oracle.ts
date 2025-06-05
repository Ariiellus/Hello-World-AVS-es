export async function getPrice(id: number) {
    const response = await fetch(`https://api.coinmarketcap.com/data-api/v3/cryptocurrency/detail?id=${id}&range=1m`);
    const data = await response.json();
    return data.data.statistics.price;
}