#[no_mangle]
pub extern fn get_number(n: i32) -> i32 {
    return n + 27;
}

#[no_mangle]
pub extern fn fibonacci(x: i32) -> i32 {
    if x <= 2 {
        return 1;
    } else {
        return fibonacci(x - 1) + fibonacci(x - 2);
    }
}

// This is the `main` thread
fn main() {
    // let res: u32 = map_reduce();
    // println!("{}", res)
}
