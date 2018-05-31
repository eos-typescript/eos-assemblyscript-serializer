//Documentation: https://github.com/EOSIO/eos/blob/48ee386b3ab91b00fbe5342314a7d3ae5fd9bdc2/contracts/eosiolib/datastream.hpp
//Class stuff: https://github.com/EOSIO/eos/blob/48ee386b3ab91b00fbe5342314a7d3ae5fd9bdc2/contracts/eosiolib/datastream.hpp#L459
//Parts of this class are inspired by eosargentina, thank you.

import { HEADER_SIZE, allocate } from "~lib/internal/string";

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
	skip(s: usize): void{
		this.pos += s;
	}
	readToDest(destptr: usize, len: usize): void{
		//eosio_assert( size_t(_end - _pos) >= (size_t)s, "read" );
		copy_memory(pos, destptr, len);
		this.pos += len;
	}

	readVarint32(): u32 {
    		let value: u32 = 0;
		let shift: u32 = 0;
		let b: u8 = 0;
    		do {
      			b = this.read<u8>();
      			value |= <u32>(b & 0x7f) << (7 * shift++);
    		} while (b & 0x80);
    		return value;
	}
	
	writeVarint32(value: u32): void {
    		do {
      			let b: u8 = <u8>value & <u8>0x7f;
      			value >>= 7;
      			b |= ((value > 0 ? 1 : 0) << 7);
      			this.write<u8>(b);
    		} while( value );
  	}

	//should probably replace this to u8 write
	write<T>(val: T): void{
		//eosio_assert( _pos < _end, "put" );
		store<T>(pos, val);
		this.pos += sizeof<T>();
	}
	read<T>(): T {
		let value: T = load<T>(this.pos);
		this.pos += sizeof<T>();
		return value;
	}


	writeBool(b: bool): void{
		this.write<u8>(<u8>b);
	}

	readBool(): bool {
		return this.read<u8>() != 0;
	}
	
	writeString(s: string): void {
		this.writeVarint32(s.lengthUTF8() -1);//not sure about the minus 1 yet
		if(s == "") return;
		copy_memory(this.pos, s.toUTF8(), s.lengthUTF8());
	}
	readString(): string {
		let len: u32 = this.readVarint32();
		//let len: u32 = this.read<u32>();
    		if(len == 0) return "";
    		let s = allocate(len);
		for(let i: u32 = 0; i < len; i++){
			let b: u16 = this.read<u8>();
      			store<u16>(<usize>s + 2*i , b, HEADER_SIZE);
		}
		return s;
	}

	//Does this work with nonprimitives?
	//May need arr to be T?
	writeVector<T>(arr: T[]): void {
		this.writeVarint32(arr.length);
		this.writeArray(arr);
	}
	
	//Don't think this works with non primitives though
	//May need to return T?
	readVector<T>(): T[] {
		let len = this.readVarint32();
		return this.readArray<T>(len);
	}

	readArray<T>(len: u32): T[]{
		if( len == 0 ) return new Array<T>();
                let arr = new Array<T>(len);
                for(let i: u32 = 0; i < len; i++){
                        arr[i] = this.read<T>();
                }
                return arr;
	}

	writeArray<T>(arr: T[]): void {
		for(let i: u32 = 0; i < arr.length; i++)
                        this.write<T>(arr[i]);	
	}

	//todo:
	writeObject<T>(obj: T): void{
		for(let i: u32 = 0; i < Object.values(obj).length; i++){

		}
	}
	//todo:
	//different signature than other reads, perhaps change it
	readObject<T>(obj: T): void {
		let vals = Object.values(obj);
        	for(let i: u32 = 0; i < vals.length; i++){
			obj[i] = vals[i];
		}
	}

	//The AssemblyScript map implementation is too bad for now: https://github.com/AssemblyScript/assemblyscript/blob/master/std/assembly/map.ts
	/*function writeMap<K, V>(m: Map<K, V>): void{
	*	this.writeVarint32(m.size());
	*	for(key as m.__keys){
	*		this.write<K>(key);
	*		this.write<V>(m.get(key));
	*	}
	*
	*}
	*
	*function readMap<K, V>(): Map<K,V> {
	*	let m = new Map<K, V>();
	*	let len = this.readVarint32();		
	*	for(var i: u32; i < len; i++){
	*		m.set(this.read<K>(), this.read<V>());//Not sure if read<K> is guaranteed to execute first here
	*	}
	*}
	*/
	//TODO: Sets 
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
