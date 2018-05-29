//Documentation: https://github.com/EOSIO/eos/blob/48ee386b3ab91b00fbe5342314a7d3ae5fd9bdc2/contracts/eosiolib/datastream.hpp
//Class stuff: https://github.com/EOSIO/eos/blob/48ee386b3ab91b00fbe5342314a7d3ae5fd9bdc2/contracts/eosiolib/datastream.hpp#L459

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
	read(destptr: usize, len: usize): void{
		//eosio_assert( size_t(_end - _pos) >= (size_t)s, "read" );
		copy_memory(pos, destptr, len);
		this.pos += len;
	}

	//Thank you eosargentina
	readVarint32(): u32 {
    		var value: u32 = 0;
    		var shift: u32 = 0;
    		do {
      			var b = this.read<u8>();
      			value |= <u32>(b & 0x7f) << (7 * shift++);
    		} while (b & 0x80);
    		return value;
	}
	
	//All hail eosargentina
	writeVarint32(value: u32): void {
    		do {
      			let b: u8  = <u8>value & <u8>0x7f;
      			value >>= 7;
      			b |= ((value > 0 ? 1 : 0) << 7);
      		this.store<u8>(b);
    		} while( value );
  	}

	//should probably replace this to u8 write
	write<T>(val: T): void{
		//eosio_assert( _pos < _end, "put" );
		this.store<T>(pos, val);
		this.pos += sizeof<val>();
	}

	read(): u8{
		//eosio_assert( _pos < _end, "get" );
		let value: T = load<u8>(pos);
		this.pos += sizeof(1);
		return value;
	}

	writeBool(b: bool): void{
		this.write<u8>(<u8>b);
	}

	readBool(): bool {
		return this.read<u8>() != 0;
	}
	
	writeString(s: string): void {
		this.write(s.lengthUTF8());
		if(s == "") return;
		copy_memory(this.pos, s.toUTF8(), s.lengthUTF8());
	}

	//Oh mighty eosargentina
	readString(): string {
		var len = this.readVarint32();
    		if(len == 0) return "";
    		let s = allocate(len);
    		for(i: u32; i < len; i++){
			var b : u16 = this.read<u8>();
      			this.store<u16>(<usize>s + 2*i , b, HEADER_SIZE);
		}
		return s;
	}

	//Praise eosargentina
	//Does this work with nonprimitives?
	//May need arr to be T?
	writeVector<T>(arr: T[], len: u32): void {
		this.writeVarint32(len);
		this.writeArray(arr);
	}
	
	//Thanks to the allmighty eosargentina!
	//Don't think this works with non primitives though
	//May need to return T?
	readVector<T>(): T[] {
		let len = this.readVarint32();
		return this.readArray<T>(len);
	}

	readArray<T>(len: u32): T[]{
		if( len == 0 ) return new Array<T>();
                let arr = new Array<T>(len);
                for(var i: u32 = 0; i < len; i++){
                        arr[i] = this.read<T>();
                }
                return arr;
	}

	writeArray<T>(arr: T[]): void {
		 for(item as arr)
                        this.write<T>(item);	
	}

	writeObject<T>(obj: T): void{
		for(val: Object.values(obj)) {
			this.write(val);//type problem?
		}
	}
	
	//different signature than other reads, perhaps change it
	readObject<T>(obj: T): void {
		for(val: Object.values(obj)){
			
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
