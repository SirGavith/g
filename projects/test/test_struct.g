struct byte_xy {
    byte x;
    byte y;
};

func void get(byte_xy this, byte newx) {
    //this.x = newx;
    return;
};

let byte_xy pos;

pos.x = 9; // location: 2 + 0

//pos.y; // location: 2 + 1

pos.get(6);

get(pos, 6);


//struct byte_rect {
//    byte_xy xy1;
//    byte_xy xy2;
//};


// let byte_rect rect;
// rect.xy1 = pos;

// rect.(xy1.x);
0;