var leftList;
var rightList;
var tFrame;
var clone;

window.addEventListener( "load", function(){
    // Setting global variables when loaded
    leftList = document.getElementById('left-list');
    rightList = document.getElementById('right-list');
    tFrame = document.getElementById('task-frame');
    clone = tFrame.cloneNode(true);
    clone.setAttribute("id", "");

    var oTask = document.getElementById("opening-task");
    addAnimation(oTask, "bounceInDown");
    loadFromStorage( oTask );


    var elAddTask = document.getElementById("add-task");
    elAddTask.addEventListener( "click", function(){
        addTask();
    });
});

function loadFromStorage( oTask ){
    if (localStorage) {
        var tasks = JSON.parse(localStorage.getItem("tasks"));
        if (tasks) {
            console.log(tasks);
            addClass(oTask, "no-show");
            oTask.parentNode.removeChild(oTask);
            for (var i = 0; i < tasks.length; i++) {
                addTask(tasks[i], "none", false );
            }
            listsSort( true );
            var tasks = document.getElementsByClassName('task');
            for (var i = 0; i < tasks.length; i++) {
                var task = tasks[i];
                removeClass(task, 'no-show');
                addAnimation(task, 'bounceInDown');
            }
        } else {
            removeClass( document.getElementById("opening-task"), "no-display")
        }
    }
}


function addClass(el, className) {
    if (el.classList)
        el.classList.add(className);
    else
        el.className += ' ' + className;
}
function removeClass(el, className) {
    if (el.classList)
        el.classList.remove(className);
    else
        el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
}
function hasClass(el, className) {
    el.classList.contains(className);
}
function findPos(obj) {
    var curtop = 0;
    if (obj.offsetParent) {
        do {
            curtop += obj.offsetTop;
        } while (obj === obj.offsetParent);
        return [curtop];
    }
}
function windowAtBottom() {
    var last = window.scrollY;
    window.scrollY++;
    var same = last == window.scrollY;
    window.scrollY--;
    console.log("window at bottom:", same);
    return (same);
}
function scrollDownTo(YTO, S, MS) {
    console.log("scroll down..");
    var last = 0;
    function CLO() {

        this.time = undefined;

        var smooth = (S) ? S : 12,
            ms = (MS) ? 1000 / MS : 1000 / 60,
            that = this;
        this.start = function (towards) {
            var cur = window.scrollY;
            window.scrollTo(0, window.scrollY + Math.ceil((towards - cur) / smooth));
            last = window.scrollY;
            if (Math.abs(towards - cur) >= 1 && last != cur) {
                that.time = setTimeout(function () { that.start(towards); }, ms);
            }
        }
    }
    var ncl = new CLO();
    ncl.start(YTO);
    return ncl;
}


function mobileMode() {
    return (window.innerWidth < 560);
}
//returns positive if left has more.
function listcompare( sort ) {
    return (!mobileMode() && sort ) ? (leftList.offsetHeight - rightList.offsetHeight) : sort;
}

function listsSort( sort ) {
    if (mobileMode()) { return; }

    while (listcompare( sort ) < 0
        && rightList.lastElementChild
        && rightList.lastElementChild.getBoundingClientRect().top > leftList.getBoundingClientRect().bottom) 
    {
        //fix left
        leftList.appendChild(rightList.lastElementChild);
    }
    
    while (listcompare( sort ) > 0
        && leftList.lastElementChild
        && leftList.lastElementChild.getBoundingClientRect().top > rightList.getBoundingClientRect().bottom ) 
    {
        // fix right
        rightList.insertBefore(leftList.lastElementChild, rightList.lastElementChild);
    }
}

function addAnimation(obj, animationName, animationEndCallback) {
    addClass(obj, "animated");
    addClass(obj, animationName);
    obj.addEventListener("animationend", function anim(e) {
        removeClass(obj, "animated");
        removeClass(obj, animationName);
        obj.removeEventListener( "animationend", anim);
        if (animationEndCallback) {
            animationEndCallback();
        }
    }, false);
}

function addTask(data, animation, scroll, sort) {
    sort = sort || true;
    var newTask = clone.cloneNode(true);
    newTask.children[1].innerHTML = data || "";
    var cancelButton = newTask.firstElementChild;
    var editContent = newTask.children[1];
    var editListener = function() {
        saveTasks();
    };
    var deleteListener = function() {
        cancelButton.removeEventListener('focusout', deleteListener);
        editContent.removeEventListener("input", editListener);
        deleteTask(newTask);
    };

    editContent.addEventListener("focusout", editListener, true);
    cancelButton.addEventListener("click", deleteListener);
    if (animation !== "none") {
        addAnimation(newTask, animation || "bounceIn");
    } else {
        addClass(newTask, "no-show");
        console.log("no show")
    }

    if (listcompare( sort ) <= 0 && !mobileMode()) {
        leftList.appendChild(newTask);
    } else {
        rightList.appendChild(newTask);
    }
    saveTasks();
    if (!scroll) {
        scrollDownTo(findPos(newTask));
    }
}

var tasksBeingDeleted = [];
var deleting = 0;
var deleted = 0;
function deleteTask(oldTask) {
    if (oldTask.dataset.deleting) return;
    oldTask.dataset.deleting = true;
    deleting++; deleted++;
    tasksBeingDeleted.push(oldTask);
    addAnimation(oldTask, "bounceOut", function () {
        deleting--;
        addClass(oldTask, "no-show");
        window.setTimeout(function () {
            if (deleting == 0) {
                tasksBeingDeleted = tasksBeingDeleted.filter(function (oldTask) {
                    oldTask.parentNode.removeChild(oldTask);
                    return false;
                });
                saveTasks();
            }
            listsSort( true );
            console.log("sorted");
        }, (deleted != rightList.children.length + leftList.children.length) ? 450 : 1);
    });
}


function saveTasks() {
    console.log("saving");
    removeClass(tFrame, "task");

    var cList = [];
    cList.push(leftList);
    cList.push(rightList);

    var content = [];
    for (var j = 0; j < 2; j++) {
        var taskList = cList[j].getElementsByClassName('task');
        for (var i = 0; i < taskList.length; i++) {
            var task = taskList[i];
            content.push(task.children[1].innerHTML);
        }
    }

    if (localStorage) {
        localStorage.setItem("tasks", JSON.stringify(content));
    }

    addClass(tFrame, "task");
}

window.onresize = function() {
    listsSort( true );
}
