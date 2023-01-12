class UIHelper {
    static SUCCESS_NOTICE_TYPE = "SUCCESS";
    static ERROR_NOTICE_TYPE = "ERROR";

    static #getNoticeElemente() {
        return document.getElementById("notice");
    }

    static #displayNotice(type, message, fadeAfter) {
        let noticeElement = this.#getNoticeElemente();
        noticeElement.classList.remove(type === UIHelper.SUCCESS_NOTICE_TYPE ? "ui-state-error" : "ui-state-highlight");
        noticeElement.classList.remove(type === UIHelper.SUCCESS_NOTICE_TYPE ? "ui-state-highlight" : "ui-state-error");

        noticeElement.style.display = "block";

        noticeElement.querySelector("span").innerText = message;

        if (fadeAfter !== -1)
            setTimeout(() => {
                noticeElement.style.display = "none";
            }, fadeAfter * 1000);
    }

    static displaySuccessMessage(message, fadeAfter = 10) {
        this.#displayNotice(UIHelper.SUCCESS_NOTICE_TYPE, message, fadeAfter);
    }

    static displayErrorMessage(message, fadeAfter = -1) {
        this.#displayNotice(UIHelper.ERROR_NOTICE_TYPE, message, fadeAfter);
    }
}