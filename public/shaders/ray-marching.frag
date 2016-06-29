vec3 Ray( vec3 Origin, vec3 Direction, float T )
{
  return Origin + Direction * T;
}

vec3 GetPixelView( vec3 CameraView, float ProjDist, int Width, int Height )
{
  float XOff, YOff;
  float XScale = 1.0 * float(Width);
  float YScale = 1.0 * float(Height);

  vec3 Up = vec3(0, 1, 0);
  vec3 Right = normalize(cross(CameraView, Up));
  Up = cross(Right, CameraView);

  if (Width > Height)
    YScale *= float(Width) / float(Height);
  else
    XScale *= float(Height) / float(Width);

  XOff = gl_FragCoord.x / XScale * 2.0 - 1.0;
  YOff = gl_FragCoord.y / YScale * 2.0 - 1.0;

  return normalize(XOff * Right + YOff * Up + ProjDist * CamView);
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

vec3 GetNormal( vec3 Point )
{
  float E = 0.00001;

  return normalize(vec3(SDF(Point + vec3(E, 0, 0)).x - SDF(Point - vec3(E, 0, 0)).x,
                        SDF(Point + vec3(0, 0, E)).x - SDF(Point - vec3(0, E, 0)).x,
                        SDF(Point + vec3(0, 0, E)).x - SDF(Point - vec3(0, 0, E)).x));
}