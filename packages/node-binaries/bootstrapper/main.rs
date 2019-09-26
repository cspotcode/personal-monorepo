use std::process::Command;
use std::env;
use fs;

fn main() {
    let selfPath = env::args()[0];
    let selfPathCanon = fs::canonicalize(selfPath);
    
}
// Prints each argument on a separate line
for argument in env::args() {
    println!("{}", argument);
}

let output = if cfg!(target_os = "windows") {
    Command::new("cmd")
            .args(&["/C", "echo hello"])
            .output()
            .expect("failed to execute process")
