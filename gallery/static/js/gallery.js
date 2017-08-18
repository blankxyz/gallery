$(document).ready(function() {
  if ($('input[id^="tag-"]').length) {
    $.get('/api/memberlist', function(data) {
      $('input[id^="tag-"]').selectize({
        persist: false,
        openOnFocus: false,
        closeAfterSelect: true,
        plugins: ['remove_button'],
        valueField: 'uuid',
        labelField: 'name',
        searchField: 'name',
        selectOnTab: true,
        options: data,
        items: tags
      });
    });
  }
});

function afterMkdir(data) {
    if (data['error'].length > 0) {
        var message = " Error: Could not create director" + ((data['error'].length > 1) ? 'ies' : 'y') + ":";
        for (var i = 0, len = data['error'].length; i < len; i++) {
            var file_name = data['error'][i];
            message += " " + file_name + (i == (len - 1) ? '': ',');
        }
        $('#descriptions .modal-body').append("<div class='alert alert-danger'><span class='glyphicon glyphicon-exclamation-sign'></span>" + message + ".</div>");
        $('#descriptions').modal('show');
    }
    if (data['success'].length > 0) {
        for (var i = 0, len = data['success'].length; i < len; i++) {
            var dir_name = data['success'][i]['name'];
            var dir_id = data['success'][i]['id'];
            var field = "<label class='control-label' for='desc-" + dir_id + "'>"
                        + "Enter a description for folder \"<strong>" + dir_name + "</strong>\":"
                        + "<a href='/view/dir/" + dir_id + "'>(View folder)</a></label>"
                        + "<input type='text' class='form-control' id='desc-" + dir_id + "'>";
            $('#descriptions .modal-body .form-group').append(field);
        }
        $('#descriptions input').focusout(function() {
            var this_id = $(this).attr('id').substr($(this).attr('id').indexOf("-") + 1)
            $.ajax({
                type: "POST",
                url: "/api/dir/describe/" + this_id,
                data: {
                    description: $('input[id="desc-' + this_id + '"]').val()
                }
            });
        });
        $('#descriptions').modal('show');
    }
}

// Create a new directory
function createDirectory() {
    if ($('input[name="gallery_dir_id"]').val().length > 0) {
        $.ajax({
            type: "POST",
            url: "/api/mkdir",
            data: {
                dir_name: $('input[name="gallery_dir_name"]').val(),
                parent_id: $('input[name="gallery_dir_id"]').val()
            },
            success: afterMkdir
        });
    } else {
        var warning = "<div class='alert alert-dismissible alert-danger' id='mkdir-alert'><button type='button' class='close' data-dismiss='alert'>&times;</button><span class='glyphicon glyphicon-exclamation-sign'></span> Select a parent directory before creating folder.</div>";
        $('#mkdir').after(warning);
    }
}

function afterUpload(file, response) {
    console.log("Uploaded file:");
    console.log(file);
    console.log("Response:");
    console.log(response);
    if (response['error'].length > 0) {
        var message = " Error: Could not upload file" + ((response['error'].length > 1) ? 's' : '') + ":";
        for (var i = 0, len = response['error'].length; i < len; i++) {
            var file_name = response['error'][i];
            message += " " + file_name + (i == (len - 1) ? '': ',');
        }
        $('#descriptions .modal-body').append("<div class='alert alert-danger'><span class='glyphicon glyphicon-exclamation-sign'></span>" + message + ".</div>");
        $('#descriptions').modal('show');
    }
    if (response['success'].length > 0) {
        for (var i = 0, len = response['success'].length; i < len; i++) {
            var file_name = response['success'][i]['name'];
            var file_id = response['success'][i]['id'];
            var field = "<img src='/api/thumbnail/get/" + file_id + "'>"
                        + "'<label class='control-label' for='desc-" + file_id + "'>"
                        + "Enter a description for file \"<strong>" + file_name + "</strong>\": "
                        + "<a href='/view/file/" + file_id + "'>(View file)</a></label>"
                        + "<input type='text' class='form-control' id='desc-" + file_id + "'>";
            $('#descriptions .modal-body .form-group').append(field);
        }
        $('#descriptions input').focusout(function() {
            var this_id = $(this).attr('id').substr($(this).attr('id').indexOf("-") + 1)
            $.ajax({
                type: "POST",
                url: "/api/file/describe/" + this_id,
                data: {
                    caption: $('input[id="desc-' + this_id + '"]').val()
                }
            });
        });
        $('#descriptions').modal('show');
    }
}

// Rebuild the directory tree
function populateDirTree() {
    $.get("/api/get_dir_tree", function(data) {
        $('#fileList').tree({
            data: [data],
            autoOpen: 0
        });
        $('#fileList').bind(
            'tree.select',
            function(event) {
                // The clicked node is 'event.node'
                var node = event.node;
                $('input[name="gallery_dir_id"]').val(node.id);
            }
        );
    });
}

// Rebuild the directory tree
function populateJumpDirTree() {
    $.get("/api/get_dir_tree", function(data) {
        $('#fileList').tree({
            data: [data],
            autoOpen: 0
        });
        $('#fileList').bind(
            'tree.select',
            function(event) {
                // The clicked node is 'event.node'
                var node = event.node;
                window.location = "/view/dir/" + node.id;
            }
        );
    });
}

function editFileDescription() {
    $('#edit-description').modal('show');
    $('#edit-description button').click(function() {
        var this_id = $('#edit-description input[id^="desc"]').attr('id').substr($('#edit-description input[id^="desc"]').attr('id').indexOf("-") + 1);
        if ($('#edit-description input[id="rename-' + this_id + '"]').length) {
            $.ajax({
                type: "POST",
                url: "/api/file/rename/" + this_id,
                data: {
                    title: $('input[id="rename-' + this_id + '"]').val()
                }
            });
        }
        if ($('#edit-description input[id="tag-' + this_id + '"]').length) {
            var members = JSON.stringify($('input[id="tag-' + this_id + '"]').val().split(','));
            $.ajax({
                type: "POST",
                url: "/api/file/tag/" + this_id,
                data: {
                    members: members
                }
            });
        }
        $.ajax({
            type: "POST",
            url: "/api/file/describe/" + this_id,
            data: {
                caption: $('input[id="desc-' + this_id + '"]').val()
            }
        });
    });
}

function editDirDescription() {
    $('#edit-description').modal('show');
    $('#edit-description button').click(function() {
        var this_id = $('#edit-description input[id^="desc"]').attr('id').substr($('#edit-description input[id^="desc"]').attr('id').indexOf("-") + 1);
        if ($('#edit-description input[id="rename-' + this_id + '"]').length) {
            $.ajax({
                type: "POST",
                url: "/api/dir/rename/" + this_id,
                data: {
                    title: $('input[id="rename-' + this_id + '"]').val()
                }
            });
        }
        $.ajax({
            type: "POST",
            url: "/api/dir/describe/" + this_id,
            data: {
                description: $('input[id="desc-' + this_id + '"]').val()
            }
        });
    });
}

function deleteDir() {
    $('#delete').modal('show');
    $('#delete button[id^="confirm"]').click(function(e) {
        e.preventDefault();
        var this_id = $('#delete button[id^="confirm"]').attr('id').substr($('#delete button[id^="confirm"]').attr('id').indexOf("-") + 1);
        $.ajax({
            method: "POST",
            url: "/api/dir/delete/" + this_id,
            success: function() {
                window.location.href = '/view/dir/' + parent;
            }
        });
    });
}

function deleteFile() {
    $('#delete').modal('show');
    $('#delete button[id^="confirm"]').click(function(e) {
        e.preventDefault();
        var this_id = $('#delete button[id^="confirm"]').attr('id').substr($('#delete button[id^="confirm"]').attr('id').indexOf("-") + 1);
        $.ajax({
            method: "POST",
            url: "/api/file/delete/" + this_id,
            success: function() {
                window.location.href = '/view/dir/' + parent;
            }
        });
    });
}

function kbGalleryVideoSelect(e) {
    var video = $('video');
    if (video.length > 0) {
        e.preventDefault();
        if (video[0].paused == true) {
            video[0].play();
        } else {
            video[0].pause();
        }
    }
}

function kbGallerySelect() {
    var elem = $('#child_list .selected').find('a')[0];

    if(elem) {
        elem.click();
    }
}
function kbGalleryPrevious() {
    if(mode == "VIEW_DIR") {
        prev = $('#child_list .selected').prevAll()[0];
        if(prev) {
            $('#child_list .selected').removeClass('selected');
            $(prev).addClass('selected');
        } else if ($('#child_list .selected').length == 0) {
            $('#child_list .col-md-3').last().addClass('selected');
        }
    }
    if(mode == "VIEW_FILE") {
        if ($('.previous').find('a').length == 0) {
            return;
        }
        $('.previous').find('a')[0].click();
    }
}
function kbGalleryNext() {
    if(mode == "VIEW_DIR") {
        next = $('#child_list .selected').nextAll()[0];
        if(next) {
            $('#child_list .selected').removeClass('selected');
            $(next).addClass('selected');
        } else if ($('#child_list .selected').length == 0) {
            $('#child_list .col-md-3').first().addClass('selected');
        }
    }
    if(mode == "VIEW_FILE") {
        if ($('.next').find('a').length == 0) {
            return;
        }
        $('.next').find('a')[0].click();
    }
}
function kbGalleryUp() {
    $('ul.breadcrumb li').not('.active').last().find('a')[0].click();
}
function kbGalleryRandom() {
    document.location = "/view/random_file";
}
function kbGalleryHelp() {
    $('#help').modal('show');
}
function kbGalleryCreateDir() {
    if(mode == "VIEW_DIR") {
        document.location = "/create_folder";
    }
}
function kbGalleryUpload() {
    if(mode == "VIEW_DIR") {
        document.location = "/upload";
    }
}
function kbGalleryFastNavigation(e) {
    e.preventDefault();
    document.location = "/jump_dir";
}

function kbGalleryFullscreen() {
    if(mode == "VIEW_FILE") {
        setFullscreen($("#file-content").first()[0]);
    }
}

Mousetrap.bind('space', kbGalleryVideoSelect);
Mousetrap.bind('enter', kbGallerySelect);
Mousetrap.bind(['h', 'left'], kbGalleryPrevious);
Mousetrap.bind(['l', 'right'], kbGalleryNext);
Mousetrap.bind(['k', 'up'],  kbGalleryUp);
Mousetrap.bind('r', kbGalleryRandom);
Mousetrap.bind('?', kbGalleryHelp);
Mousetrap.bind('c', kbGalleryCreateDir);
Mousetrap.bind('u', kbGalleryUpload);
Mousetrap.bind('f', kbGalleryFullscreen);
Mousetrap.bind(['command+k', 'ctrl+k'], kbGalleryFastNavigation);

function setFullscreen(elem) {
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    }
    else {
        console.log("No Fullscreen API Available")
    }
}
