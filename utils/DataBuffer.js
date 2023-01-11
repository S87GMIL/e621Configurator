class DataBuffer {
    static addDataToBuffer(key, dataJson, expirationDays = 30) {

        let expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + expirationDays);

        dataJson.expiration = expirationDate.getTime();
        dataJson.e621ConfiguratorVersion = E621Configurator.version;
        GM_setValue(key, dataJson);
    }

    static getBufferData(key) {
        let data = GM_getValue(key);
        if (!data)
            return null;


        if (data.expiration <= Date.now() || !dataJson.e621ConfiguratorVersion || dataJson.e621ConfiguratorVersion < E621Configurator.version) {
            this.removeDataFromBuffer(key);
            return null;
        }

        return data;
    }

    static removeDataFromBuffer(key) {
        GM_deleteValue(key);
    }
}
