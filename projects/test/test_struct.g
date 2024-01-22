struct byte_xy {
    byte x = 0;
    byte y;
};

struct byte_rect {
    byte_xy xy1;
    byte_xy xy2;
};

let byte_xy pos;

pos.x = 3;
//parsed as pos.(x=3) (bad!)
pos.y = 4;

let byte_rect rect;
rect.xy1 = pos;

rect.xy1.x;
// 3