'use strict'

const data = require('./datbase');

function print(inventory) {
  let receipt = '***<没钱赚商店>购物清单***\n';
  for(var item of inventory.items){
    receipt += `名称：${item.name}，数量：${item.amount}${item.unit}，单价：${item.price.toFixed(2)}(元)，小计：${item.priceSum.toFixed(2)}(元)\n`;
  }
  receipt += `----------------------\n挥泪赠送商品：\n`;
  for(var promotion of inventory.promotions){
    receipt += `名称：${promotion.name}，数量：${promotion.savedAmount}${promotion.unit}\n`;
  }
  receipt += '----------------------\n'+
            `总计：${inventory.price.totalPrice.toFixed(2)}(元)\n节省：${inventory.price.totalSave.toFixed(2)}(元)\n` +
            '**********************'
  console.log(receipt);
};

function getInventory(itemsInfo) {
  let promotionsInfo = data.loadPromotions();
  let promotions = [];
  let price = {totalPrice: 0, totalSave: 0};
  for(var item of itemsInfo){
    item.priceSum = item.price * item.amount;
    for(var barcode of promotionsInfo[0].barcodes){
      let savedAmount = Math.floor(item.amount / 3);
      if(item.barcode == barcode && savedAmount > 0){
        let saveMoney = savedAmount * item.price;
        item.priceSum -= saveMoney;
        price.totalSave += saveMoney;
        promotions.push({name: item.name, savedAmount: savedAmount, unit: item.unit});
      }
    }
    price.totalPrice += item.priceSum;
  }
  return {items: itemsInfo, promotions: promotions, price: price};
};

function countAmount(items) {
  return items.reduce((amountInfo, item) => {
    let id, count;
    [id, count] = (!item.includes('-'))? [item, 1]
    : item.split('-', 2).map((s, i, arr) => (i == 1)? s = parseInt(arr[i]) : s = arr[i]);
    let entry = amountInfo.find((e) => e.barcode === id);
    (entry)? entry.amount += count : amountInfo.push({barcode: id, amount: count});
    return amountInfo;
  }, []);
};

function getItemsInfo(selectedItems) {
  let selectedItemsInfo = countAmount(selectedItems);
  let allItemsInfo = data.loadAllItems();
  for(var entry of selectedItemsInfo){
    for(var item of allItemsInfo){
      if(entry.barcode === item.barcode)
        Object.assign(entry, item);
    }
  }
  return selectedItemsInfo;
};

module.exports = function printInventory(selectedItems) {
  var itemsInfo = getItemsInfo(selectedItems);
  var inventory = getInventory(itemsInfo);
  print(inventory);
};
