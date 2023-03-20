$(document).ready(function() {
    const $inspector = $("#inspector");

    $inspector.draggable({
        handle: $inspector.children(".drag-handle")
    });

    $inspector.on("open", function() {
        const height = $(this).height();
        $(this)
            .css("left", "50%")
            .css("top", `calc(50% - ${height}px)`)
            .removeClass("hidden");
    });

    $inspector.on("close", function() {
        $(this).addClass("hidden");
    });
    $inspector.find(".button.close").on("click", function() {
        $inspector.trigger("close");
    })
});
