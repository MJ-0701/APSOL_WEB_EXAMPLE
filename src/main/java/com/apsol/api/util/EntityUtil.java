package com.apsol.api.util;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.math.BigDecimal;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import org.springframework.core.convert.ConversionService;

import com.apsol.api.entity.Bascode;
import com.apsol.api.entity.Employee;
import com.apsol.api.entity.area.Area;
import com.apsol.api.entity.company.Company;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class EntityUtil {
	
	

	public static void setConversionService(ConversionService conversionService) {
		EntityUtil.conversionService = conversionService;
	}

	public static <T> T convertData(String val, Class<T> clazz) {

		try {
			if (conversionService != null) {

				if (conversionService.canConvert(String.class, clazz)) {

					return conversionService.convert(val, clazz);

				} else {
					new RuntimeException("값을 변환할 수가 없습니다.");
				}
			} else {
				return null;
			}

		} catch (IllegalArgumentException e) {
			throw new RuntimeException(e.getMessage());
		}
		return null;
	}

	private static ConversionService conversionService;

	public static interface IConverter {
		Object convert(String val);
	}

	public static <T> T toEntity(Map<String, String> data, T inst) {
		return setData(inst, data, null, null);
	}
	
	public static <T> T toEntity2(Map<String, Object> data, Class<T> clazz) {
        T inst;
        try {
            inst = clazz.newInstance();
        } catch (InstantiationException e) {
            throw new RuntimeException(e.getMessage());
        } catch (IllegalAccessException e) {
            throw new RuntimeException(e.getMessage());
        }

        Method[] methods = clazz.getMethods();
        for (Method m : methods) {

            if (m.getName().indexOf("set") != 0)
                continue;

            String name = m.getName().substring(3);
            name = name.substring(0, 1).toLowerCase() + name.substring(1);
            Object val = data.get(name);

            if (val != null) {
                try {

                    m.invoke(inst, val);

                } catch (IllegalAccessException | IllegalArgumentException | InvocationTargetException e) {
                    new RuntimeException(e.getMessage());
                }

            }
        }

        return inst;
    }

	public static <T> T toEntity(Map<String, String> data, Class<T> clazz) {
		return toEntity(data, clazz, null, null);
	}

	public static BigDecimal NULL_NUM = null;

	public static <T> T setData(T inst, Map<String, String> data) {
		return setData(inst, data, null, null);
	}
	public static <T> T setDataObject(T inst, Map<String, Object> data) {
		return setDataObject(inst, data, null, null);
	}

	public static <T> T setData(T inst, Map<String, String> data, Map<String, IConverter> converters,
			Map<Class<?>, IConverter> typeConverters) {
		Class<? extends Object> clazz = inst.getClass();
		Method[] methods = clazz.getMethods();
		for (Method m : methods) {

			if (m.getName().indexOf("set") != 0)
				continue;

			String name = m.getName().substring(3);
			name = name.substring(0, 1).toLowerCase() + name.substring(1);

			if (data.containsKey(name) == false)
				continue;
			
			String val = data.get(name); 

			try {

				if (val != null) {
					
					log.debug("set {}" + name);

					if ((converters != null && converters.containsKey(name))) {
						m.invoke(inst, converters.get(name).convert(val));
					} else {

						if (typeConverters != null && typeConverters.containsKey(m.getParameterTypes()[0])) {

							m.invoke(inst, typeConverters.get(m.getParameterTypes()[0]).convert(val));

						} else {

							if (conversionService != null) {

								if (conversionService.canConvert(String.class, m.getParameterTypes()[0])) {

									try {
										m.invoke(inst, conversionService.convert(val, m.getParameterTypes()[0]));
									} catch (NumberFormatException e) {
										m.invoke(inst, NULL_NUM);
									}

								} else {
									throw new RuntimeException("값을 변환할 수가 없습니다.");
								}
							} else {

								if (m.getParameterTypes()[0] == BigDecimal.class) {
									m.invoke(inst, new BigDecimal(val));
								}
								if (m.getParameterTypes()[0] == Date.class) {
									Calendar calendar = Calendar.getInstance();
									calendar.setTimeInMillis(Long.parseLong(val));
									m.invoke(inst, calendar.getTime());
								} else {
									m.invoke(inst, val);
								}
							}
						}
					}

				} else {
					if (converters != null && converters.containsKey(name)) {
						m.invoke(inst, converters.get(name).convert(val));
					}
				}

			} catch (IllegalAccessException e) {
				throw new RuntimeException(e.getMessage());
			} catch (IllegalArgumentException e) {
				throw new RuntimeException(e.getMessage() + " " + name);
			} catch (InvocationTargetException e) {
				throw new RuntimeException(e.getTargetException().getMessage());
			}

		}

		return inst;

	}
	
	public static <T> T setDataObject(T inst, Map<String, Object> data, Map<String, IConverter> converters,
			Map<Class<?>, IConverter> typeConverters) {
		Class<? extends Object> clazz = inst.getClass();
		Method[] methods = clazz.getMethods();
		for (Method m : methods) {

			if (m.getName().indexOf("set") != 0)
				continue;

			String name = m.getName().substring(3);
			name = name.substring(0, 1).toLowerCase() + name.substring(1);

			if (data.containsKey(name) == false)
				continue;
			
			String val = String.valueOf(data.get(name)); 

			try {

				if (val != null) {
					
					log.debug("set {}" + name);

					if ((converters != null && converters.containsKey(name))) {
						m.invoke(inst, converters.get(name).convert(val));
					} else {

						if (typeConverters != null && typeConverters.containsKey(m.getParameterTypes()[0])) {

							m.invoke(inst, typeConverters.get(m.getParameterTypes()[0]).convert(val));

						} else {

							if (conversionService != null) {

								if (conversionService.canConvert(String.class, m.getParameterTypes()[0])) {

									try {
										m.invoke(inst, conversionService.convert(val, m.getParameterTypes()[0]));
									} catch (NumberFormatException e) {
										m.invoke(inst, NULL_NUM);
									} catch (IllegalArgumentException e) {
										continue;
									}

								} else {
									throw new RuntimeException("값을 변환할 수가 없습니다.");
								}
							} else {

								if (m.getParameterTypes()[0] == BigDecimal.class) {
									m.invoke(inst, new BigDecimal(val));
								}
								if (m.getParameterTypes()[0] == Date.class) {
									Calendar calendar = Calendar.getInstance();
									calendar.setTimeInMillis(Long.parseLong(val));
									m.invoke(inst, calendar.getTime());
								} else {
									m.invoke(inst, val);
								}
							}
						}
					}

				} else {
					if (converters != null && converters.containsKey(name)) {
						m.invoke(inst, converters.get(name).convert(val));
					}
				}

			} catch (IllegalAccessException e) {
				throw new RuntimeException(e.getMessage());
			} catch (IllegalArgumentException e) {
				throw new RuntimeException(e.getMessage() + name);
			} catch (InvocationTargetException e) {
				throw new RuntimeException(e.getTargetException().getMessage());
			}

		}

		return inst;

	}

	public static <T> T toEntity(Map<String, String> data, Class<T> clazz, Map<String, IConverter> converters,
			Map<Class<?>, IConverter> typeConverters) {
		T inst;
		try {
			inst = clazz.newInstance();
		} catch (InstantiationException | IllegalAccessException e) {
			throw new RuntimeException(e.getMessage());
		}

		return setData(inst, data, converters, typeConverters);
	}

	/*
	 * public static <T> T toEntity(Map<String, Object> data, Class<T> clazz) { T
	 * inst; try { inst = clazz.newInstance(); } catch (InstantiationException |
	 * IllegalAccessException e) { throw new RuntimeException(e.getMessage()); }
	 * 
	 * Method[] methods = clazz.getMethods(); for (Method m : methods) {
	 * 
	 * if (m.getName().indexOf("set") != 0) continue;
	 * 
	 * String name = m.getName().substring(3); name = name.substring(0,
	 * 1).toLowerCase() + name.substring(1);
	 * 
	 * Object val = data.get(name); if (val != null) {
	 * 
	 * try { if (conversionService != null) {
	 * 
	 * if (conversionService.canConvert(String.class, m.getParameterTypes()[0])) {
	 * 
	 * m.invoke(inst, conversionService.convert(val, m.getParameterTypes()[0]));
	 * 
	 * } else { new RuntimeException("값을 변환할 수가 없습니다."); } } else { m.invoke(inst,
	 * val); }
	 * 
	 * } catch (IllegalAccessException | IllegalArgumentException |
	 * InvocationTargetException e) { new RuntimeException(e.getMessage()); }
	 * 
	 * } }
	 * 
	 * return inst; }
	 */

	public static Map<String, Object> toMap(Object obj, String... ignorePaths) {
		Map<String, Object> map = new HashMap<String, Object>();
		return toMap(map, obj, ignorePaths);
	}

	public static Map<String, Object> toMap(Map<String, Object> map, Object obj, String... ignorePaths) {
		Class<?> clz = obj.getClass();

		Method[] ms = clz.getMethods();

		for (Method m : ms) {

			String name = null;

			if (m.getName().indexOf("get") == 0) {
				name = m.getName().substring(3);
			} else if (m.getName().indexOf("is") == 0) {
				name = m.getName().substring(2);
			}

			if (name == null)
				continue;

			name = name.substring(0, 1).toLowerCase() + name.substring(1);
			if (name.equals("class"))
				continue;

			boolean ignore = false;
			for (String ignorePath : ignorePaths) {
				if (name.equals(ignorePath)) {
					ignore = true;
					break;
				}
			}

			if (ignore)
				continue;

			try {

				if (conversionService != null) {

					if (conversionService.canConvert(m.getReturnType(), Object.class)) {
						putMap(name, conversionService.convert(m.invoke(obj), Object.class), map, m.getReturnType());
					} else {
						putMap(name, m.invoke(obj), map, m.getReturnType());
					}

				} else {
					putMap(name, m.invoke(obj), map, m.getReturnType());
				}

			} catch (IllegalAccessException | IllegalArgumentException | InvocationTargetException e) {
				System.out.println(name);

				e.printStackTrace();

			}

		}

		return map;
	}

	private static void putMap(String name, Object obj, Map<String, Object> map, Class<?> returnType) {

		if (returnType == Bascode.class) {
			if (obj == null) {
				map.put(name, "");
				map.put(name + "Name", "");
			} else {
				if (obj instanceof Bascode) {
					Bascode bascode = (Bascode) obj;
					map.put(name, bascode.getUuid());
					map.put(name + "Name", bascode.getName());
				} else {
					map.put(name, "");
					map.put(name + "Name", "");
				}
			}
		}
		else if(returnType == Company.class) {
			if (obj == null) {
				map.put(name, "");
				map.put(name + "Name", "");
			} else {
				if (obj instanceof Company) {
					Company entity = (Company) obj;
					map.put(name, entity.getCode());
					map.put(name + "Name", entity.getName());
				} else {
					map.put(name, "");
					map.put(name + "Name", "");
				}
			}
		}
		else if(returnType == Area.class) {
			if (obj == null) {
				map.put(name, "");
				map.put(name + "Name", "");
			} else {
				if (obj instanceof Company) {
					Area entity = (Area) obj;
					map.put(name, entity.getCode());
					map.put(name + "Name", entity.getName());
				} else {
					map.put(name, "");
					map.put(name + "Name", "");
				}
			}
		}
		
		/*else if (returnType == FileData.class) {
			if (obj == null) {
				map.put(name, ""); 
			} else {
				if (obj instanceof FileData) {
					FileData data = (FileData) obj;
					map.put(name, data.getCode());
				} else {
					map.put(name, "");
				}
			}
		} else if (returnType == Member.class) {
			if (obj == null) {
				map.put(name, "");
				map.put(name + "Name", "");
				map.put(name + "Username", "");
			} else {
				if (obj instanceof Member) {
					Member emp = (Member) obj;
					map.put(name, emp.getCode());
					map.put(name + "Name", emp.getName());
					map.put(name + "Username", emp.getUsername());
				} else {
					map.put(name, "");
					map.put(name + "Name", "");
					map.put(name + "Username", "");
				}
			}
		}else if (returnType == Customer.class) {
			if (obj == null) {
				map.put(name, "");
				map.put(name + "Name", ""); 
			} else {
				if (obj instanceof Customer) {
					Customer cust = (Customer) obj;
					map.put(name, cust.getCode());
					map.put(name + "Name", cust.getName()); 
				} else {
					map.put(name, "");
					map.put(name + "Name", ""); 
				}
			}
		} else if (returnType == Promotion.class) {
			if (obj == null) {
				map.put(name, "");
				map.put(name + "Name", "");
			} else {
				if (obj instanceof Promotion) {
					Promotion emp = (Promotion) obj;
					map.put(name, emp.getCode());
					map.put(name + "Name", emp.getInfo().getName());
				} else {
					map.put(name, "");
					map.put(name + "Name", "");
				}
			}
		} else if (returnType == Product.class) {
			if (obj == null) {
				map.put(name, "");
				map.put(name + "Name", "");
			} else {
				if (obj instanceof Product) {
					Product emp = (Product) obj;
					map.put(name, emp.getCode());
					map.put(name + "Name", emp.getName());
				} else {
					map.put(name, "");
					map.put(name + "Name", "");
				}
			}
		} */else if (returnType == Employee.class) {
			if (obj == null) {
				map.put(name, "");
				map.put(name + "Name", "");
			} else {
				if (obj instanceof Employee) {
					Employee emp = (Employee) obj;
					map.put(name, emp.getUsername());
					map.put(name + "Name", emp.getName());
				} else {
					map.put(name, "");
					map.put(name + "Name", "");
				}
			}
		} else {
			map.put(name, obj);
		}

	}

	public static <T> T build(Object sour, Class<T> descClass) {

		T desc;
		try {
			desc = descClass.newInstance();
		} catch (InstantiationException | IllegalAccessException e) {
			throw new RuntimeException(e.getMessage());
		}

		copy(sour, desc);

		return desc;
	}

	public static void copy(Object sour, Object desc) {

		Class<?> sourClass = sour.getClass();
		Class<?> descClass = desc.getClass();

		Method[] methods = sourClass.getMethods();
		for (Method m : methods) {
			String name = null;

			if (m.getName().indexOf("get") == 0) {
				name = m.getName().substring(3);
			} else if (m.getName().indexOf("is") == 0) {
				name = m.getName().substring(2);
			}

			if (name == null || name.equals("Class"))
				continue;

			try {

				Method descMethod = descClass.getMethod("set" + name, m.getReturnType());
				descMethod.invoke(desc, m.invoke(sour));

			} catch (NoSuchMethodException e) {

			} catch (SecurityException | IllegalAccessException | IllegalArgumentException
					| InvocationTargetException e) {

			}
		}

	}
}
