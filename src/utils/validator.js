import Joi from "joi";
import { ErrorWithStatusCode } from "./ErrorWithStatusCode.js";

const MESSAGES = {
  'number.base': 'Параметр {#key} по пути {#label} должен быть числом',
  'number.min': 'Параметр {#key} по пути {#label} должен быть больше 0',
  'string.base': 'Параметр {#key} по пути {#label} должен быть строкой',
  'string.empty': 'Параметр {#key} по пути {#label} не может быть пустой строкой',
  'object.unknown': 'Передан неизветсный параметр {#key} по пути {#label}',
  'object.min': 'Параметр {#key} не должен быть пустым',
  'object.base': 'Параметр {#key} по пути {#label} должен быть объектом',
  'array.min': 'Массив {#key} должен содержать не меньше {#limit} элементов',
  'array.base': 'Параметр {#key} по пути {#label} должен быть массивом',
  'any.required': 'Параметр {#key} по пути {#label} отсутствует',
  'any.only': 'Параметр {#key} может принимать значения {#valids}'
};

const METRIC_TYPES = ['risk indicator', 'good faith criteria'];

const validate = (validationSchema) => {
  return (req, res, next) => {
    const { error } = validationSchema.validate(req);

    if (error === undefined) {
      next()
    } else {
      throw new ErrorWithStatusCode(400, error.details[0].message)
    }
  }
}

const idSchema = Joi.number().min(1).required();

export const getObjectsGroupWithMetricsByIdSchema = validate(Joi.object({
  params: Joi.object({
    id: idSchema
  })
}).messages(MESSAGES).unknown(true));

export const updateObjectsGroupSchema = validate(Joi.object({
  params: Joi.object({
    id: idSchema
  }),
  body: Joi.object({
    objectsGroup: Joi.object({
      name: Joi.string().min(1),
      socialDamagePotencialScore: Joi.number(),
      materialDamagePotencialScore: Joi.number()
    }).required().min(1)
  })
}).messages(MESSAGES).unknown(true));

export const addMetricToObjectsGroupSchema = validate(Joi.object({
  params: Joi.object({
    id: idSchema
  }),
  body: Joi.object({
    metric: Joi.object({
      id: idSchema,
      indicators: Joi.array().required().min(2).items(Joi.object({
        id: idSchema,
        value: Joi.number().required(),
        text: Joi.string()
      })).required()
    }).required()
  })
}).messages(MESSAGES).unknown(true));

export const deleteMetricFromObjectsGroupSchema = validate(Joi.object({
  params: Joi.object({
    objectsGroupId: idSchema,
    metricId: idSchema,
  })
}).messages(MESSAGES).unknown(true));

export const updateIndicatorsValuesForObjectsGroupSchema = validate(Joi.object({
  params: Joi.object({
    id: idSchema
  }),
  body: Joi.object({
    indicators: Joi.array().required().items(Joi.object({
      id: idSchema,
      value: Joi.number().required(),
    })).required()
  })
}).messages(MESSAGES).unknown(true));

export const createMetricSchema = validate(Joi.object({
  body: Joi.object({
    metric: Joi.object({
      type: Joi.string().required().valid(...METRIC_TYPES),
      name: Joi.string().required().min(1).max(1024),
      indicators: Joi.array().required().items(Joi.object({
        text: Joi.string().required().min(1).max(512),
      }))
    }).required()
  })
}).messages(MESSAGES).unknown(true));

export const updateMetricSchema = validate(Joi.object({
  params: Joi.object({
    id: idSchema
  }),
  body: Joi.object({
    metric: Joi.object({
      type: Joi.string().valid(...METRIC_TYPES),
      name: Joi.string().min(1).max(1024)
    }).required().min(1)
  })
}).messages(MESSAGES).unknown(true));

export const addIndicatorToMetricSchema = validate(Joi.object({
  params: Joi.object({
    id: idSchema
  }),
  body: Joi.object({
    indicator: Joi.object({
      text: Joi.string().required()
    }).required()
  })
}).messages(MESSAGES).unknown(true));

export const deleteIndicatorSchema = validate(Joi.object({
  params: Joi.object({
    id: idSchema
  }),
}).messages(MESSAGES).unknown(true));

export const updateIndicatorTextSchema = validate(Joi.object({
  params: Joi.object({
    id: idSchema
  }),
  body: Joi.object({
    indicator: Joi.object({
      text: Joi.string().required().min(1)
    }).required()
  }),
}).messages(MESSAGES).unknown(true));