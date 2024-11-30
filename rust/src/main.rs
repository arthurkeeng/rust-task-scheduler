use actix_web::{web , App , HttpServer , Responder , HttpResponse};
use actix_cors::Cors;

use serde::{Deserialize , Serialize};
use uuid::Uuid;
use std::sync::Mutex;
use chrono::{Utc , DateTime};

#[derive(Serialize , Deserialize , Clone)]
struct TodoItem{
    id : Uuid , 
    title : String , 
    completed : bool , 
    created_at : DateTime<Utc>,

}

#[derive(Deserialize)]
struct CreateTodoItem{
    title : String , 
    completed : bool
}

#[derive(Deserialize)]
struct UpdateTodo{
    title : Option<String>,
    completed : Option<bool>
}

struct AppState{
    todo_list : Mutex<Vec<TodoItem>>
}


async fn get_todo(data : web::Data<AppState> ) -> impl Responder{
    let todos = data.todo_list.lock().unwrap();

    HttpResponse::Ok().json(&*todos)
}

async fn create_todo(item : web::Json<CreateTodoItem> , 
    data : web::Data<AppState>
) -> impl Responder{
    let mut todos = data.todo_list.lock().unwrap();
    let new_todo = TodoItem{
        id : Uuid::new_v4(), 
        completed : item.completed , 
        created_at : Utc::now(), 
        title : item.title.clone()

    };

    todos.push(new_todo);

    HttpResponse::Ok().json(&*todos)
}

async fn update_todo(
    path :web::Path<Uuid> , 
    item : web::Json<UpdateTodo>,
    data : web::Data<AppState>) -> impl Responder{
    let mut todos = data.todo_list.lock().unwrap();

    if let Some(todo) = todos.iter_mut().find(|todo|{
        todo.id == *path
    }){
        if let Some(title) = &item.title{
            todo.title = title.to_string();
        }
        if let Some(completed) = item.completed{
            todo.completed = completed;
        }
        HttpResponse::Ok().json(&*todos)
    }
    else {
        HttpResponse::NotFound().body("Todo was not found")
    }
}

async fn delete_todo(
    data : web::Data<AppState> , 
    path : web::Path<Uuid>
) -> impl Responder{
    let mut todos = data.todo_list.lock().unwrap();

    if todos.iter().any(|todo| todo.id == *path){
        todos.retain(|todo| todo.id != *path);
        HttpResponse::Ok().json(&*todos)
    }
    else {
        HttpResponse::NotFound().body("Todo Not Found")
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()>{
    let app_state = web::Data::new(AppState{
        todo_list : Mutex::new(Vec::new()),
    });

    HttpServer::new(move || {
        let cors = Cors::default()
                .allow_any_origin()
                .allow_any_header()
                .allow_any_method()
                .max_age(3600)  ;
        App::new().app_data(app_state.clone()).wrap(cors).route("/todos", 
         web::get().to(get_todo))
        .route("/todos", web::post().to(create_todo))
        .route("/todos/{id}",web::patch().to(update_todo))
        .route("/todos/{id}",web::delete().to(delete_todo))
    }).bind("127.0.0.1:5000")?.run().await


}