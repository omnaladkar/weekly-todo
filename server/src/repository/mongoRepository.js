import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, default: '', trim: true, maxlength: 1000 },
    dueAt: { type: Date, required: true },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['in_progress', 'completed'],
      default: 'in_progress',
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        ret.dueAt = new Date(ret.dueAt).toISOString();
        ret.createdAt = new Date(ret.createdAt).toISOString();
        ret.updatedAt = new Date(ret.updatedAt).toISOString();
        return ret;
      },
    },
  }
);

taskSchema.index({ dueAt: 1 });

const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);

let connectionPromise;

async function connect(uri) {
  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(uri, { serverSelectionTimeoutMS: 8000 })
      .catch((err) => {
        connectionPromise = null;
        throw err;
      });
  }
  return connectionPromise;
}

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export async function createMongoRepository(uri) {
  await connect(uri);

  return {
    kind: 'mongo',

    async list(query = '') {
      const filter = query
        ? {
            $or: [
              { title: { $regex: escapeRegex(query), $options: 'i' } },
              { description: { $regex: escapeRegex(query), $options: 'i' } },
            ],
          }
        : {};
      return Task.find(filter).sort({ dueAt: 1, createdAt: 1 });
    },

    async get(id) {
      return Task.findById(id);
    },

    async create(data) {
      return Task.create(data);
    },

    async update(id, patch) {
      return Task.findByIdAndUpdate(id, patch, {
        new: true,
        runValidators: true,
      });
    },

    async remove(id) {
      return Task.findByIdAndDelete(id);
    },
  };
}
