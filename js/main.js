// Remove embed when loading mobile site (width <= 720px)
if (window.outerWidth <= 720){
    var p_node = document.getElementById("text_container");
    var c_node = document.getElementById("resume_file");
    p_node.removeChild(c_node);
}