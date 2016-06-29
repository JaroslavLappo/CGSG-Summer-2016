struct MaterialData
{
  vec3 Ka;
  vec3 Kd;
  vec3 Ks;
  float Kp;
  vec3 Ke;
};

const MaterialData Materials[3] = MaterialData[3]
(
  MaterialData(vec3(0, 0, 0), vec3(0.3, 1.0, 0.8), vec3(0.2), 0.6, vec3(0, 0, 0)),
  MaterialData(vec3(0, 0, 0), vec3(0.7, 0.7, 0.7), vec3(0.2), 0.6, vec3(0, 0, 0)),
  MaterialData(vec3(0, 0, 0), vec3(0.0, 1.0, 0.0), vec3(0.2), 0.6, vec3(0, 0, 0))
);