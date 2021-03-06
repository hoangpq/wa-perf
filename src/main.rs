#[macro_use]
extern crate itertools;
extern crate util;

use util::Color;

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
            data as *mut u8, len, len,
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
            data as *mut u32, len, len,
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
            len,
        );
        for i in 0..len {
            user_data[i] += 1;
        }
    }
    std::mem::forget(user_data);
}

#[no_mangle]
#[allow(unused_mut)]
pub fn mandelbrot(buffer: *mut u8, len: usize, width: f64, height: f64,
                  pixel_size: f64, x0: f64, y0: f64, start: f64, end: f64) {
    let mut buffer = unsafe { slice::from_raw_parts_mut(buffer, len) };
    if end != 0.0 {
        draw_mandelbrot(buffer, width as i64, height as i64,
                        pixel_size, x0, y0, start as i64, end as i64);
    } else {
        draw_mandelbrot(buffer, width as i64, height as i64,
                        pixel_size, x0, y0, 0, width as i64);
    }
}

fn generate_palette() -> Vec<Color> {
    let mut palette: Vec<Color> = vec![];
    let mut roffset = 24;
    let mut goffset = 16;
    let mut boffset = 0;
    for i in 0..256 {
        palette.push(Color { red: roffset, green: goffset, blue: boffset });
        if i < 64 {
            roffset += 3;
        } else if i < 128 {
            goffset += 3;
        } else if i < 192 {
            boffset += 3;
        }
    }
    return palette;
}

pub fn draw_mandelbrot(buffer: &mut [u8], width: i64, height: i64, pixel_size: f64, x0: f64,
                       y0: f64, start: i64, end: i64) {
    let palette: Vec<Color> = generate_palette();
    iproduct!((start..end), (0..height)).foreach(|(i, j)| {
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
        let idx = (4 * (j * width + i)) as usize;

        /*buffer[idx] = 255 - k;
        buffer[idx + 1] = 255 - k;
        buffer[idx + 2] = 255 - k;
        buffer[idx + 3] = 255;*/

        let result = palette.get(k as usize);
        match result {
            Some(color) => {
                buffer[idx] = color.red;
                buffer[idx + 1] = color.green;
                buffer[idx + 2] = color.blue;
                buffer[idx + 3] = 255;
            }
            None => {}
        }
    });
}

fn _gray_scale(buffer: &mut [u8], len: usize) {
    let mut i: usize = 0;
    while i < len {
        let r: u8 = buffer[i];
        let a: u8 = buffer[i + 3];
        buffer[i] = r;
        buffer[i + 1] = r;
        buffer[i + 2] = r;
        buffer[i + 3] = a;
        i += 4
    }
}

#[no_mangle]
#[allow(unused_mut)]
pub fn gray_scale(buffer: *mut u8, len: usize) {
    let mut buffer = unsafe { slice::from_raw_parts_mut(buffer, len) };
    _gray_scale(buffer, len);
    std::mem::forget(buffer);
}

#[no_mangle]
#[allow(unused_mut)]
pub fn invert(buffer: *mut u8, len: usize) {
    let mut i: usize = 0;
    unsafe {
        let mut data = slice::from_raw_parts_mut(buffer, len);
        while i < len {
            data[i] = 255 - data[i];
            data[i + 1] = 255 - data[i + 1];
            data[i + 2] = 255 - data[i + 2];
            i += 4
        }
        std::mem::forget(data)
    }
}

#[no_mangle]
#[allow(unused_mut)]
pub fn multi_filter(buffer: *mut u8, len: usize, width: usize, filter_type: usize,
                    mag: u8, mult: u8, adj: usize) {
    let mut i: usize = 0;
    unsafe {
        let mut data = slice::from_raw_parts_mut(buffer, len);
        while i < len {
            if i % 4 != 3 {
                let mut p1: u8 = 0;
                let mut p2: u8 = 0;
                if i + adj < len { p1 = data[i + adj]; }
                if i + width * 4 < len { p2 = data[i + width * 4]; }
                data[i] = mag + mult * data[i] - p1 - p2;
            }
            i += filter_type;
        }
        std::mem::forget(data)
    }
}

#[no_mangle]
pub fn fib(n: i32) -> f64 {
    fn _fib(n: i32, a: f64, b: f64) -> f64 {
        if n == 0 {
            return b;
        } else {
            return _fib(n - 1, a + b, a);
        }
    }
    return _fib(n, 1 as f64, 0 as f64);
}

fn main() {
    let f: f64 = fib(1200);
    println!("{:?}", f);
}
