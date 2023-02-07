var ContactComponent = {
    template: document.querySelector('#contact-template'),
    data: function () {
        return { }
    },
    mounted: function () {
        document.querySelector("#send-email").onclick = function () {
            linkTo_UnCryptMailto("nbjmup+bmfyAbmfyboesjy/dpn")
            return false
        }
    }
};
