import sha256 from 'js-sha256';

export const idQR = (no_hp) =>  {
    const time = new Date();
    const random = Math.floor(Math.random() * 100);
    const result = sha256(no_hp + "" + time.toDateString + "secret123" + random);
    return result;
}