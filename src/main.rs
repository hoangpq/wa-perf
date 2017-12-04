#[macro_use]
extern crate itertools;

use std::cmp;
use itertools::Itertools;
use std::mem;
use std::slice;
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
pub extern "C" fn dealloc(ptr: *mut c_void, cap: usize) {
    unsafe {
        let _buf = Vec::from_raw_parts(ptr, 0, cap);
    }
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
pub extern "C" fn filter(data: *mut u8, len: usize) -> i32 {
    let mut pixels;
    let mut i = 0;
    unsafe {
        pixels = Vec::from_raw_parts(
            data as *mut u8, len, len
        );
        while i < len {
            pixels[i] = 255 - pixels[i];
            pixels[i + 1] = 255 - pixels[i + 1];
            pixels[i + 2] = 255 - pixels[i + 2];
            pixels[i + 3] = 255;
            i = i + 4
        }
    }
    let _len = pixels.len() as i32;
    std::mem::forget(pixels);
    _len
}

#[no_mangle]
pub fn mutate_array(data: *mut u32, len: usize) {
    let mut user_data;
    unsafe {
        user_data = Vec::from_raw_parts(
            data as *mut u32, len, len
        );
    }
    for i in 0..len {
        user_data[i] += 1;
    }
    std::mem::forget(user_data);
}

#[no_mangle]
pub extern "C" fn mutate_pointer(data: *mut c_char, len: usize) {
    let mut user_data;
    unsafe {
        user_data = Vec::from_raw_parts(
            data as *mut c_char,
            len,
            len
        );
        for i in 0..len {
            user_data[i] += 1;
        }
    }
    std::mem::forget(user_data);
}

#[no_mangle]
pub fn mandelbrot(buffer: *mut u8, len: usize, width: f64, height: f64, pixel_size: f64, x0: f64, y0: f64) {
    let mut buffer = unsafe { slice::from_raw_parts_mut(buffer, len) };
    _mandelbrot(buffer, width as i64, height as i64, pixel_size, x0, y0);
}

pub fn _mandelbrot(buffer: &mut [u8], width: i64, height: i64, pixel_size: f64, x0: f64, y0: f64) {
    iproduct!((0..width), (0..height)).foreach(|(i, j)| {
        let cr = x0 + pixel_size * (i as f64);
        let ci = y0 + pixel_size * (j as f64);

        let (mut zr, mut zi) = (0.0, 0.0);
        let k = (0..256)
            .take_while(|_| {
                let (zrzi, zr2, zi2) = (zr * zi, zr * zr, zi * zi);
                zr = zr2 - zi2 + cr;
                zi = zrzi + zrzi + ci;
                zi2 + zr2 < 2.0
            })
            .count();
        let k = cmp::min(255, k) as u8;

        let idx = (j * width + i) as usize;
        buffer[4 * idx] = 255 - k;
        buffer[4 * idx + 1] = 255 - k;
        buffer[4 * idx + 2] = 255 - k;
        buffer[4 * idx + 3] = 255;
    });
}

// This is the `main` thread
fn main() {
    println!("Hello World from Rust")
}