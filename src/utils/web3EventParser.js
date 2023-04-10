import {ethers, BigNumber} from "ethers";
import GuiseMarketplace from '../../contracts/GuiseMarketplace.json';


const web3EventParser = (eventlogs) => {
  const iface = new ethers.utils.Interface(GuiseMarketplace.abi);
  const parsedLogEvent = iface.parseLog(eventlogs[0]);

  const logArg = parsedLogEvent['args']
  const uint256Max = BigNumber.from('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
  const listingId = Number(logArg[0]);
  const seller = logArg[1];
  const nftAddress = logArg[2];
  const tokenId = Number(logArg[3]);
  const price = Number(BigNumber.from(logArg[4]).toString()) / 1e18;
  const maxDate = new Date(9999, 11, 31)
  let expDateBigNumber = BigNumber.from(logArg[5]);
  let expDateTime = new Date(Number(expDateBigNumber) * 1000);
  const expirationTime = expDateBigNumber.toString() === uint256Max.toString() ? maxDate : expDateTime;

  return {
    listingId,
    seller,
    nftAddress,
    tokenId,
    price,
    expirationTime,
  };
};

export default web3EventParser;
