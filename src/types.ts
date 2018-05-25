//https://github.com/EOSIO/eos/blob/0f84d7f8abba7d15fd09e8d72575203b42f66731/libraries/chain/include/eosio/chain/abi_def.hpp
interface struct_def {
	name: string;
	base: string;
	fields: field_def[];
}

interface field_def {
	name: string;
	type: string;
}

