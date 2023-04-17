struct Point {
    x: i32,
    y: i32
}

enum Transparency {
    Opaque,Transparent
}

struct Rectangle(Point,Point,Transparency);

impl Rectangle {
    fn covers(self, p: Point) -> bool {
        match self.2 {
            Transparency::Opaque => {
                // check if p.x is outside rectangle or if p.y is outside rectangle
                if (p.x > self.0.x && p.x > self.1.x) || (p.x < self.0.x && p.x < self.1.x) || (p.y > self.0.y && p.y > self.1.y) || (p.y < self.0.y && p.y < self.1.y){
                    false
                } else{
                    true
                }
            },
            Transparency::Transparent => false
        }
    }
}

fn test_point_is_covered_by_rectangle(p: Point, r: Rectangle){
    if r.covers(p) {
        println!("The Point is covered by the rectangle");
    } else{
        println!("The Point is not covered by the rectangle");
    }
}

fn main() {
    let p = Point{x: 10, y: 10};
    let rect1 = Rectangle(Point{x: 1, y: 1},Point{x: 5, y: 5},Transparency::Opaque);
    let rect2: Rectangle = Rectangle(Point{x: 3, y: 8}, Point{x:4, y: 10}, Transparency::Transparent);
    let rect3: Rectangle = Rectangle(Point{x: 19, y: 49}, Point{x:43, y: 190}, Transparency::Transparent);
    let rect4: Rectangle = Rectangle(Point{x: 64, y: 0}, Point{x:4, y: 14}, Transparency::Opaque);
    let rect5: Rectangle = Rectangle(Point{x: 7, y: 75}, Point{x:62, y: 15}, Transparency::Transparent);
    for r in [rect1, rect2, rect3, rect4, rect5]{
        test_point_is_covered_by_rectangle(p, r);
    }
}
