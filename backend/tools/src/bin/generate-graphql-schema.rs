use verband_graphql::verband_schema;

fn main() {
    let schema = verband_schema();
    println!("{}", schema.sdl());
}
