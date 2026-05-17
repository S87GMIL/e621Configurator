class UIHelper {
    static SUCCESS_NOTICE_TYPE = "SUCCESS";
    static ERROR_NOTICE_TYPE = "ERROR";

    static getCurrentUserName() {
        return document.querySelector('meta[name="current-user-name"]').content;
    }

    static getCurrentUserID() {
        return document.querySelector('meta[name="current-user-id"]').content;
    }

    static #getToastContainer() {
        return document.getElementById("toast-container");
    }

    static #displayNotice(type, message, fadeAfter) {
        const toastContainer = this.#getToastContainer();
        if (!toastContainer) {
            console.error("Couldn't find the toast container element!");
            return;
        }

        const messageDiv = document.createElement("div");
        const toastType = type === UIHelper.SUCCESS_NOTICE_TYPE ? "toast-success" : "toast-alert";
        messageDiv.classList.add("toast", toastType);

        const messageSpan = document.createElement("span");
        messageSpan.innerText = message;

        toastContainer.appendChild(messageDiv);
        messageDiv.appendChild(messageSpan);

        if (fadeAfter !== -1)
            setTimeout(() => {
                toastContainer.remove();
            }, fadeAfter * 1000);
    }

    static displaySuccessMessage(message, fadeAfter = 10) {
        this.#displayNotice(UIHelper.SUCCESS_NOTICE_TYPE, message, fadeAfter);
    }

    static displayErrorMessage(message, fadeAfter = -1) {
        this.#displayNotice(UIHelper.ERROR_NOTICE_TYPE, message, fadeAfter);
    }
}