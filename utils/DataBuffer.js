class DataBuffer {
    static addDataToBuffer(key, dataJson, expirationDays = 30) {

        let expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + expirationDays);

        dataJson.expiration = expirationDate.getTime();
        GM_setValue(key, JSON.stringify(dataJson));
    }

    static getBufferData(key) {
        let data = GM_getValue(key);
        if (!data)
            return null;

        let dataJson = JSON.parse(data);

        if (dataJson.expiration <= Date.now()) {
            this.removeDataFromBuffer(key);
            return null;
        }

        return dataJson;
    }

    static removeDataFromBuffer(key) {
        GM_deleteValue(key);
    }
}