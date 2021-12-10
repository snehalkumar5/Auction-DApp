var VikreyAuction = artifacts.require("VikreyAuction.sol");
var BlindAuction = artifacts.require("BlindAuction.sol");
var AveragePriceAuction = artifacts.require("./AveragePriceAuction.sol");
var Market = artifacts.require("./Market.sol");


module.exports = function (deployer, network, accounts) {
    deployer.deploy(Market);
    deployer.deploy(BlindAuction);
    deployer.deploy(VikreyAuction);
    deployer.deploy(AveragePriceAuction);
};
