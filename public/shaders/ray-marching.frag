vec3 Ray( vec3 Origin, vec3 Direction, float T )
{
  return Origin + Direction * T;
}

vec2 Intersect( vec3 V )
{
  float T = tMin;

  for (int i = 0; i < iterMax; i++)
  {
    float d;

    d = SDF(Ray(CamPos, V, T)).x;
    T += d;

    if (d < dMin || T > tMax)
      break;
  }

  if (SDF(Ray(CamPos, V, T)).x < dMin)
    return vec2(T, SDF(Ray(CamPos, V, T)).y);
  else
    return vec2(0.0, 0.0);
}

float IntersectShadow( vec3 Point, vec3 Light )
{
  float T = 2.0 * tMin;
  vec3 Direction = normalize(Light - Point);

  for (int i = 0; i < iterMax; i++)
  {
    float d;
    vec2 sdf;

    sdf = SDF(Ray(Point, Direction, T));
    d = sdf.x;
    T += d;

    if (d < dMin || T > tMax)
      break;
  }

  if (SDF(Ray(Point, Direction, T)).y < 0.0)
    return 1.0;
  else
    return 0.0;
}

vec3 Normal( vec3 Point )
{
  float E = 0.00001;

  return normalize(vec3(SDF(Point + vec3(E, 0, 0)).x - SDF(Point - vec3(E, 0, 0)).x,
                        SDF(Point + vec3(0, 0, E)).x - SDF(Point - vec3(0, E, 0)).x,
                        SDF(Point + vec3(0, 0, E)).x - SDF(Point - vec3(0, 0, E)).x));
}