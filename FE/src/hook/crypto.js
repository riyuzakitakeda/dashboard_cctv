import { AES, enc, mode, pad } from "crypto-js";
import { encode, decode, parse, stringify } from "urlencode";

const key = "your_secret_k3y"; // Store securely!
const aesKey = enc.Utf8.parse("aeskeyaeskeyaeskeyaeskeyaeskey32");
const aesIv = enc.Utf8.parse("0123456789abcdef");
const aesOptions = {
  iv: aesIv,
  mode: mode.CBC,
  padding: pad.Pkcs7,
};

export function EncryptData(data) {
  return AES.encrypt(data, aesKey, aesOptions).toString();
}

export function DecryptData(data) {
  return AES.decrypt(data, aesKey, aesOptions).toString(enc.Utf8);
}

export function EncodeData(data) {
  return encode(data, "gbk");
}
