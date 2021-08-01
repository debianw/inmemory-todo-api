const express = require('express');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const app = express();
const port = process.env.PORT || 3004;

let cache = [];

app.use(bodyParser.json());

const sortByZorder = (a, b) => {
  if (a.zorder < b.zorder) {
    return a;
  }
  if (a.zorder > b.zorder) {
    return b;
  }

  return 0;
};

app.get('/tasks', (req, res) => {
  res.json(cache.sort(sortByZorder));
});

app.post('/task', (req, res) => {
  cache.push({
    id: uuid.v4(),
    name: req.body.name,
    completed: false,
    zorder: 0,
    createdOn: (new Date()).toISOString(),
  });

  res.json(req.body);
});

app.delete('/task/:id', (req, res) => {
  const { id } = req.params;
  const foundTask = cache.find(task => task.id === id);

  if (!foundTask)
    throw new Error(`Item not found`);

  console.log('Deleting task => ', id);

  cache = cache.filter(task => task.id !== id); 

  res.json(foundTask);
});

app.patch('/task/:id', (req, res) => {
  const { id } = req.params;
  const changes = req.body;
  const foundIndex = cache.findIndex(task => task.id === id);

  if (foundIndex === -1)
    throw new Error(`Item not found`);

  cache = [
    ...(cache.slice(0, foundIndex)),
    {
      ...cache[foundIndex],
      ...changes,
    },
    ...(cache.slice(foundIndex + 1))
  ];

  return cache[foundIndex];
});

app.post('/tasks/reorder', (req, res) => {
  console.log('body => ', req.body);
  const taskIds = req.body.ids;

  console.log('reordering tasks => ', taskIds);

  const tasks = taskIds.map((id, pos) => {
    const found = cache.find(t => t.id === id);

    return {
      ...found,
      zorder: pos, 
    };
  });

  cache = tasks;

  return cache;
});

app.listen(port, () => console.log(`Server listening on port ${port}`));