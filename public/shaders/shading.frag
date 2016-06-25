vec3 Shade( vec3 Point, vec3 View, vec3 Normal, float Material )
{
  vec3 LightColor = vec3(1.0, 1.0, 1.0);
  vec3 Ka = vec3(0.0);
  vec3 Ke = vec3(0.0);
  vec3 Kd = vec3(0.3, 1.0, 0.8);
  vec3 Ks = vec3(0.2);
  float Kp = 0.6;
  vec3 Color = vec3(0.0, 0.0, 0.0);
  float Shadow;

  Shadow = IntersectShadow(Point, LightPos);

  if (Shadow < 0.5)
    return Ka + Ke;

  if (abs(Material - 2.0) < 0.1)
    Kd = vec3(0.7, 0.0, 0.0);

  if (abs(Material - -1.0) < 0.1)
    return LightColor;

  Color += Ka;

  Color += Kd * dot(Normal, normalize(LightPos - Point));

  vec3 Reflect;

  Reflect = normalize(2.0 * Normal + normalize(Point - LightPos));

  float ReflectRes = -dot(View, Reflect);

  if (ReflectRes > 0.0)
    Color += Ks * pow(ReflectRes, Kp);

  Color *= LightColor;

  Color += Ke;

  float dist = length(Point - LightPos);

  if (dist > 2.0)
    return vec3(0.0);
  return (1.0 - dist / 2.0) * Color;
}
