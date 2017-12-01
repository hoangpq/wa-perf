use std::mem;
use std::ffi::CString;
use std::os::raw::{c_char, c_void};


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

#[no_mangle]
pub extern "C" fn alloc(size: usize) -> *mut c_void {
    let mut buf = Vec::with_capacity(size);
    let ptr = buf.as_mut_ptr();
    mem::forget(buf);
    return ptr as *mut c_void;
}

#[no_mangle]
pub extern "C" fn dealloc_str(ptr: *mut c_char) {
    unsafe {
        let _ = CString::from_raw(ptr);
    }
}

#[no_mangle]
pub fn fact(n: u32) -> u64 {
    let mut n = n as u64;
    let mut result = 1;
    while n > 0 {
        result = result * n;
        n = n - 1;
    }
    result
}

#[no_mangle]
pub fn fact_str(n: u32) -> *mut c_char {
    let res = fact(n);
    let s = format!("{}", res);
    let s = CString::new(s).unwrap();
    s.into_raw()
}

#[no_mangle]
pub fn get_array_data(data: *mut [i32]) -> [i32; 3] {
    return [1, 2, 3];
}

// This is the `main` thread
fn main() {
    // let res: u32 = map_reduce();
    // println!("{}", res)
}
