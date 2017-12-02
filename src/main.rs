use std::mem;
use std::ffi::CString;
use std::os::raw::{c_char, c_void};

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
pub extern "C" fn get_array_data(data: &mut [u8]) -> Vec<u8> {
    let mut i = 0;
    while i < data.len() {
        data[i] = 255 - data[i];
        data[i + 1] = 255 - data[i + 1];
        data[i + 2] = 255 - data[i + 2];
        data[i + 3] = 255;
        i = i + 4
    }
    data.iter().cloned().collect()
}

#[no_mangle]
pub fn mutate_array(data: *mut Vec<i32>, len: usize) -> Vec<u8> {
    /*for offset in 0..len {
        unsafe { println!("Rust - value in array: {:?}", *data.offset(offset)); }
    }*/
    let mut user_data;
    unsafe {
        user_data = Vec::from_raw_parts(
            data as *mut u8, len, len
        );
    }
    for i in 0..len {
        user_data[i] += 1;
    }
    // println!("{:?}", user_data[0]);
    // std::mem::forget(user_data);
    return user_data
}

// This is the `main` thread
fn main() {}
