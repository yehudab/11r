// Static comments
// modified from https://github.com/travisdowns/travisdowns.github.io/blob/master/assets/main.js

function attachFormEvents() {
    $('.js-form').on('submit', function () {
        var form = this;

        $("#comment-form-submit").html(
            '<svg class="icon spin"><use xlink:href="#icon-loading"></use></svg> על זה...'
        );
        $(form).addClass('disabled');

        const url = $(this).attr('action');
        let response = null;
        let error = "unknown";
        fetch(url, {
            method: $(this).attr('method'),
            body: $(this).serialize(),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data && data.success) {
                    alert("התגובה התקבלה ותוצג לאחר בקרה");

                    $("#comment-form-submit")
                        .html("שליחה");

                    $(form)[0].reset();
                    $(form).removeClass('disabled');
                    grecaptcha.reset();
                } else {
                    let error = "Unknown error";
                    if (data) {
                        if (data.errorCode) {
                            error = data.errorCode;
                        } else if (data.error && data.error.text) {
                            error = data.error.text;
                        }
                    }
                    console.log(error);
                    alert(`Oops, something is wrong: ${error}`);
                    $("#comment-form-submit").html("שליחה")
                    $(form).removeClass('disabled');
                    grecaptcha.reset();
                }
            }).catch(err => {
                alert("Oops, something is wrong: " + err.toString());
                $("#comment-form-submit").html("שליחה")
                $(form).removeClass('disabled');
                grecaptcha.reset();
            });

        return false;
    });

}

function attachReplyToEvents() {
    $('button.comment-reply').on('click', function () {
        const parent = $(this).parent();
        const form = $('.comments-form');
        const cancel = form.find('.cancel-comment');
        const parentId = parent.data('comment-id');
        const commentReplyingToId = $("#comment-replying-to-id");

        commentReplyingToId.val(parentId);
        parent.append(form.remove());
        attachFormEvents();
        form.find('textarea').trigger('focus');
        cancel.one('click', function () {
            $('#respond').append(form.remove());
            attachFormEvents();
            commentReplyingToId.val('');
            return false;
        });
    });
}

export { attachFormEvents, attachReplyToEvents };