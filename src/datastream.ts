//Documentation: https://github.com/EOSIO/eos/blob/48ee386b3ab91b00fbe5342314a7d3ae5fd9bdc2/contracts/eosiolib/datastream.hpp
//Class stuff: https://github.com/EOSIO/eos/blob/48ee386b3ab91b00fbe5342314a7d3ae5fd9bdc2/contracts/eosiolib/datastream.hpp#L459
import { HEADER_SIZE, allocate } from "~lib/internal/string";

import {string2cstr, toUTF8Array} from "./utils";

export class DataStream {
	start: usize;
	pos: usize;
	end: usize;


	constructor(start: usize, startlen: u32) {
		this.start = start;
		this.pos = start;
		this.end = start + startlen;
	}
	
	/**
      	*  Skips a specified number of bytes from this stream
      	*  @brief Skips a specific number of bytes from this stream
      	*  @param s The number of bytes to skip
      	*/
	function skip(s: usize): void{
		pos += s;
	}
	function read(destptr: usize, len: usize): void{
		//eosio_assert( size_t(_end - _pos) >= (size_t)s, "read" );
		copy_memory(pos, destptr, len);
		pos += len;
	}

	//Thank you eosargentina
	function  readVarint32(): u32 {
    		var value: u32 = 0;
    		var shift: u32 = 0;
    		do {
      			var b = this.read<u8>();
      			value |= <u32>(b & 0x7f) << (7 * shift++);
    		} while (b & 0x80);
    		return value;
	}
	
	//All hail eosargentina
	function  writeVarint32(value: u32): void {
    		do {
      			let b: u8  = <u8>value & <u8>0x7f;
      			value >>= 7;
      			b |= ((value > 0 ? 1 : 0) << 7);
      		this.store<u8>(b);
    		} while( value );
  	}

	//should probably replace this to u8 write
	function write<T>(val: T): void{
		//eosio_assert( _pos < _end, "put" );
		store<T>(pos, val);
		pos += sizeof<val>();
	}

	//should probably replace this with u8 read
	function read<T>(): T{
		//eosio_assert( _pos < _end, "get" );
		let value: T = load<u8>(pos);
		pos += 1;
		return value;
	}

	function writeBool(b: bool): void{
		ds.write<u8>(<u8>b);
	}

	function readBool(): bool {
		return read<u8>() != 0;
	}
	
	function writeString(s: string): void {
		write(s.lengthUTF8());
		if(s == "") return;
		copy_memory(this.pos, s.toUTF8(), s.lengthUTF8());
	}

	//Oh mighty eosargentina
	function readString(): string {
		var len = this.readVarint32();
    		if(len == 0) return "";
    		let s = allocate(len);
    		for(i: u32; i < len; i++){
			var b : u16 = this.read<u8>();
      			store<u16>(<usize>s + 2*i , b, HEADER_SIZE);
		}
		return s;
	}

	//Praise eosargentina
	//Does this work with nonprimitives?
	//May need arr to be T?
	function writeVector<T>(arr: T[], len: u32): void {
		this.writeVarint32(len);
		for(item as arr)
			write<T>(item);
	}
	
	//Thanks to the allmighty eosargentina!
	//Don't think this works with non primitives though
	//May need to return T?
	function readVector<T>(): T[] {
		let len = this.readVarint32();
		if( len == 0 ) return new Array<T>();
		let arr = new Array<T>(len);
		for(var i : u32 = 0; i < len; i++){
      			arr[i] = read<T>();
		}
    		return arr;
	}
	function readArray
	//TODO: Sets
	//TODO: Maps
	//TODO: Flat_sets
	//TODO: Flat_maps
	//TODO: Tuples
	//TODO: Class instances https://github.com/EOSIO/eos/blob/48ee386b3ab91b00fbe5342314a7d3ae5fd9bdc2/contracts/eosiolib/datastream.hpp#L459
	//TODO: Interface instances?
	//TODO: Checksum160
	//TODO: Checksum512
	//TODO: Pubkey
	//TODO: key256
	//TODO: Checksum256
}
