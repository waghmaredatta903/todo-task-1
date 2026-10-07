const cl = console.log;

const todoForm = document.getElementById("todoForm");
const todoContainer = document.getElementById("todoContainer");
const addTodoBtn = document.getElementById("addTodoBtn");
const updateTodoBtn = document.getElementById("updateTodoBtn");
const inputControl = document.getElementById("inputControl");
const spinner = document.getElementById("spinner");

const BASE_URL = `https://crud-b22-e9992-default-rtdb.asia-southeast1.firebasedatabase.app`;
const TODO_URL = `${BASE_URL}/todos.json`;

const state = {
    todoArr: [],
    edit_id: null
};

function snackBar(text, msg, icon) {
    Swal.fire({
        text: text,
        icon: icon,
        title: msg,
        timer: 3000,
        confirmButtonText : "OK",
        confirmButtonColor: "#ff6347",
         customClass: {
        icon: "my-swal-icon"
    }
    })

}

function handlespinner(flag) {
    if (flag) {
        spinner.classList.remove("d-none");
    } else {
        spinner.classList.add("d-none");
    }
}

function renders(arr) {
    let result = ``;

    arr.forEach(ele => {
        result += `
            <li class="list-group-item d-flex justify-content-between" id="${ele.id}">
                <strong>${ele.todoInput}</strong>
                <div>
                    <button onclick="onEditTodo(this)" type="button" class="btn btn-outline-warning">Edit</button>
                    <button onclick="onRemoveTodo(this)" type="button" class="btn btn-outline-danger">Remove</button>
                </div>
            </li>
        `;
    });

    todoContainer.innerHTML = result;
}

function Objtodo(obj) {
    state.todoArr = [];

    for (const key in obj) {
        obj[key].id = key;
        state.todoArr.unshift(obj[key]);
    }
}

function addfetchTodo() {
    handlespinner(true);

    fetch(TODO_URL)
        .then(res => {
            if (!res.ok) {
                throw new Error("Error");
            }
            return res.json();
        })
        .then(obj => {
            Objtodo(obj);
            renders(state.todoArr);
        })
        .catch(err => {
            cl(err);
        })
        .finally(() => {
            handlespinner(false);
        });
}

addfetchTodo();

function createTodo(eve) {
    eve.preventDefault();
    handlespinner(true);
    let newObj = {
        todoInput: inputControl.value
    };
    fetch(TODO_URL, {
        method: "POST",
        body: JSON.stringify(newObj),
        headers: {
            "content-type": "application/json"
        }
    })
        .then(res => {
            if (!res.ok) {
                throw new Error("Error");
            }
            return res.json();
        })
        .then(res => {
            newObj.id = res.name;
            state.todoArr.unshift(newObj);
            let li = document.createElement("li");
            li.className = "list-group-item d-flex justify-content-between";
            li.id = res.name;
            li.innerHTML = `
                <strong>${newObj.todoInput}</strong>
                <div>
                    <button onclick="onEditTodo(this)" type="button" class="btn btn-outline-warning">Edit</button>
                    <button onclick="onRemoveTodo(this)" type="button" class="btn btn-outline-danger">Remove</button>
                </div>
            `;
            todoContainer.prepend(li);
            todoForm.reset();
            snackBar("Added!!", `The Todo with id ${newObj.id} is Added successfully`, `success`)
        })
        .catch(err => {
            cl(err);
        })
        .finally(() => {
            handlespinner(false);
        });
}

function onEditTodo(ele) {
    handlespinner(true);
    let EDIT_ID = ele.closest("li").id;
    state.edit_id = EDIT_ID;
    let EDIT_URL = `${BASE_URL}/todos/${EDIT_ID}.json`;
    fetch(EDIT_URL)
        .then(res => {
            if (!res.ok) {
                throw new Error("Error");
            }
            return res.json();
        })
        .then(data => {
            inputControl.value = data.todoInput;

            addTodoBtn.classList.add("d-none");
            updateTodoBtn.classList.remove("d-none");
        })
        .catch(err => {
            snackBar(err)
        })
        .finally(() => {
            handlespinner(false);
        });
}

function onUpdateTodo(eve) {
    eve.preventDefault();

    let UPDATE_ID = state.edit_id;
    let UPDATE_URL = `${BASE_URL}/todos/${UPDATE_ID}.json`;
    let UPDATE_OBJ = {
        todoInput: inputControl.value
    };
    handlespinner(true);
    fetch(UPDATE_URL, {
        method: "PATCH",
        body: JSON.stringify(UPDATE_OBJ),
        headers: {
            "content-type": "application/json"
        }
    })
        .then(res => {
            if (!res.ok) {
                throw new Error("Error");
            }
            return res.json();
        })
        .then(data => {
            let getIndex = state.todoArr.findIndex(t => t.id === UPDATE_ID);
            state.todoArr[getIndex].todoInput = UPDATE_OBJ.todoInput;
            let li = document.getElementById(UPDATE_ID);
            li.innerHTML = `
                <strong>${UPDATE_OBJ.todoInput}</strong>
                <div>
                    <button onclick="onEditTodo(this)" type="button" class="btn btn-outline-warning">Edit</button>
                    <button onclick="onRemoveTodo(this)" type="button" class="btn btn-outline-danger">Remove</button>
                </div>
            `;

            todoForm.reset();
            state.edit_id = null;
            snackBar("UPDATED!!!", `The Todo with id ${UPDATE_ID} is updated successfully`, `success`)
            updateTodoBtn.classList.add("d-none");
            addTodoBtn.classList.remove("d-none");
        })
        .catch(err => {
            cl(err);
        })
        .finally(() => {
            handlespinner(false);
        });
}

function onRemoveTodo(ele) {
    let DELETE_ID = ele.closest("li").id;
    Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#a9816d",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
    }).then((result) => {
        if (result.isConfirmed) {
            let DELETE_URL = `${BASE_URL}/todos/${DELETE_ID}.json`;
            handlespinner(true);
            fetch(DELETE_URL, {
                method: "DELETE"
            })
                .then(res => {
                    if (!res.ok) {
                        throw new Error("Error");
                    }
                    return res.json();
                })
                .then(data => {
                    let getIndex = state.todoArr.findIndex(t => t.id === DELETE_ID);
                    state.todoArr.splice(getIndex, 1);
                    document.getElementById(DELETE_ID).remove();
                    snackBar("DELETED!!",`The Todo with id ${DELETE_ID} is Deleted Successfully`,`success`)
                })
                .catch(err => {
                    cl(err);
                })
                .finally(() => {
                    handlespinner(false);
                });
        }
    })
}


    updateTodoBtn.addEventListener("click", onUpdateTodo);

    todoForm.addEventListener("submit", createTodo);