# Протокол запросов к ресурсам, предполагающим выдачу массива значений

## Формат выдачи результата

В представленном ниже примере ответа системы поле `meta` содержит данные о выборке. При этом поле `total` содержит общее количество элементов выборки:

```
    {
        meta: {
            total: 1
        },
        result: [
            {
                data: 1234
            }
        ]
    }
```

## Пагинация

Пагинация выполняется путём включения в `URI` запроса параметров `take`, `skip`. Где `take` означает количество выбираемых элементов, `skip` -- количество пропускаемых элементов. Пагинация как правило имеет смысл в том случае, если задана сортировка выборки

## Фильтрация

Фильтрация выполняется путём включения в `URI` поля `filters`.

Это поле может быть описано как:

```
    <filters> ::= <filter> | <filter>, <filters>

    <filter> ::= { logic: <logic>, filters: <filters> } |
                { field: <fieldname>, operator: <operator>, value: <value> }

    <logic> ::= and | or

    <operator> ::= eq | neq | gt | gte | lt | lte | isNull | isNotNull
```

### Примеры фильтрующих запросов:

```
      filters: [
        {
          field: 'subject',
          operator: 'eq',
          value: '3a8a5d96-06e5-11e6-ade3-23725d68a20c'
        },
        {
          field: 'request',
          operator: 'gte',
          value: '3a8a5d96-06e5-11e6-ade3-23725d68a20c'
        }
      ]
    }
```

```
      filters: {
        logic: 'and',
        filters: [
          {
            field: 'subject',
            operator: 'eq',
            value: '3a8a5d96-06e5-11e6-ade3-23725d68a20c'
          },
          {
            logic: 'or',
            filters: [
              {
                field: 'a',
                operator: 'eq',
                value: 2
              },
              {
                logic: 'and',
                filters: [
                  {
                    field: 'a',
                    operator: 'eq',
                    value: 2
                  },
                  {
                    field: 'b',
                    operator: 'isNull'
                  }
                ]
              }
            ]
          }
        ]
      }
```

## Сортировка

Сортировка выполняется путём добавления в `URI` поля `sort`.

Логика использования поля описывается как:

```
    <sort> ::= <sortItem> | <sortItem>, <sort>

    <sortItem> ::= <fieldname> | { field: <fieldname> } | 
        { field: <fieldname>, dir: <dir> }

    <dir> ::= asc | desc
```

### Примеры сортировки

```
      sort: [ 'subject' ]
```

```
      sort: {
        field: 'subject',
        dir: 'desc'
      }
```

```
      sort: [
        'field1',
        {
          field: 'field2'
        },
        {
          field: 'field3',
          dir: 'asc'
        },
        {
          field: 'subject',
          dir: 'desc'
        }
      ]
```

