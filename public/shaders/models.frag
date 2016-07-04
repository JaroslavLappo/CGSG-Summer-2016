uniform sampler3D Texture;

vec4 texture3D( sampler3D TextureSampler, vec3 Coordinates )
{
  vec3 fcoordinates = floor(Coordinates * 256.0);
  vec3 t = Coordinates * 256.0 - fcoordinates;
  vec4 color = vec4(0);

  color +=        t.x  *        t.y  *        t.z  * texture(TextureSampler, Coordinates - vec3(0, 0, 0) / 256.0);
  color +=        t.x  *        t.y  * (1.0 - t.z) * texture(TextureSampler, Coordinates - vec3(0, 0, 1) / 256.0);
  color +=        t.x  * (1.0 - t.y) *        t.z  * texture(TextureSampler, Coordinates - vec3(0, 1, 0) / 256.0);
  color +=        t.x  * (1.0 - t.y) * (1.0 - t.z) * texture(TextureSampler, Coordinates - vec3(0, 1, 1) / 256.0);
  color += (1.0 - t.x) *        t.y  *        t.z  * texture(TextureSampler, Coordinates - vec3(1, 0, 0) / 256.0);
  color += (1.0 - t.x) *        t.y  * (1.0 - t.z) * texture(TextureSampler, Coordinates - vec3(1, 0, 1) / 256.0);
  color += (1.0 - t.x) * (1.0 - t.y) *        t.z  * texture(TextureSampler, Coordinates - vec3(1, 1, 0) / 256.0);
  color += (1.0 - t.x) * (1.0 - t.y) * (1.0 - t.z) * texture(TextureSampler, Coordinates - vec3(1, 1, 1) / 256.0);

  return color;
}

float sdTexture( vec3 Point )
{
  if (length(Point) > 0.4)
    return length(Point) - 0.2;
  return texture3D(Texture, (Point / 0.4 + vec3(1)) / 2.0).r * 0.4;
}