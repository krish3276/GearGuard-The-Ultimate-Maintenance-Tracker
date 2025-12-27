const { EquipmentCategory, User } = require('../models');
const { NotFoundError } = require('../utils/errors');

const getAllCategories = async () => {
  return EquipmentCategory.findAll({
    include: [{ model: User, as: 'responsible', attributes: ['id', 'name', 'email'] }],
    order: [['name', 'ASC']]
  });
};

const getCategoryById = async (id) => {
  const category = await EquipmentCategory.findByPk(id, {
    include: [{ model: User, as: 'responsible', attributes: ['id', 'name', 'email'] }]
  });
  if (!category) {
    throw new NotFoundError('Category not found');
  }
  return category;
};

const createCategory = async (data) => {
  return EquipmentCategory.create(data);
};

const updateCategory = async (id, data) => {
  const category = await EquipmentCategory.findByPk(id);
  if (!category) {
    throw new NotFoundError('Category not found');
  }
  await category.update(data);
  return getCategoryById(id);
};

const deleteCategory = async (id) => {
  const category = await EquipmentCategory.findByPk(id);
  if (!category) {
    throw new NotFoundError('Category not found');
  }
  await category.destroy();
  return { message: 'Category deleted successfully' };
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
