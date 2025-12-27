import { useState, useEffect } from 'react';
import { Plus, FolderTree, Loader2, AlertTriangle, Trash2, Edit2 } from 'lucide-react';
import { Header } from '../components/layout';
import { Card, Button, Badge, Modal, Input, Select } from '../components/common';
import { categoriesAPI, usersAPI } from '../services/api';

const EquipmentCategories = () => {
    const [categories, setCategories] = useState([]);
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        responsible_user_id: '',
        company: '',
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [categoriesRes, usersRes] = await Promise.all([
                categoriesAPI.getAll(),
                usersAPI.getAll().catch(() => ({ data: [] })),
            ]);
            setCategories(categoriesRes.data?.data || categoriesRes.data || []);
            setUsers(usersRes.data?.data || usersRes.data || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (category = null) => {
        if (category) {
            setSelectedCategory(category);
            setFormData({
                name: category.name || '',
                responsible_user_id: category.responsible_user_id?.toString() || '',
                company: category.company || '',
            });
        } else {
            setSelectedCategory(null);
            setFormData({ name: '', responsible_user_id: '', company: '' });
        }
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!formData.name) {
            alert('Category name is required');
            return;
        }
        try {
            setSaving(true);
            const payload = {
                name: formData.name,
                company: formData.company || null,
                responsible_user_id: formData.responsible_user_id ? parseInt(formData.responsible_user_id) : null,
            };
            if (selectedCategory) {
                await categoriesAPI.update(selectedCategory.id, payload);
            } else {
                await categoriesAPI.create(payload);
            }
            await fetchData();
            setShowModal(false);
        } catch (err) {
            console.error('Error saving category:', err);
            alert(err.response?.data?.message || 'Failed to save category');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (categoryId) => {
        if (!confirm('Are you sure you want to delete this category?')) return;
        try {
            setDeleting(true);
            await categoriesAPI.delete(categoryId);
            await fetchData();
        } catch (err) {
            console.error('Error deleting category:', err);
            alert(err.response?.data?.message || 'Failed to delete category');
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div>
                <Header title="Equipment Categories" subtitle="Manage equipment categories" />
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <Header title="Equipment Categories" subtitle="Manage equipment categories" />
                <div className="p-6">
                    <Card className="text-center py-12">
                        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                        <p className="text-rose-400 mb-4">{error}</p>
                        <Button onClick={fetchData}>Retry</Button>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Header title="Equipment Categories" subtitle="Manage equipment categories" />

            <div className="p-6">
                <div className="flex justify-end mb-6">
                    <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => handleOpenModal()}>
                        New Category
                    </Button>
                </div>

                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-dark-700/50">
                                    <th className="table-header">Name</th>
                                    <th className="table-header">Responsible</th>
                                    <th className="table-header">Company</th>
                                    <th className="table-header text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-dark-700/30">
                                {categories.map((category) => (
                                    <tr key={category.id} className="hover:bg-glass-white transition-colors">
                                        <td className="table-cell">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-primary-500/20">
                                                    <FolderTree className="w-4 h-4 text-primary-400" />
                                                </div>
                                                <span className="font-medium text-gray-200">{category.name}</span>
                                            </div>
                                        </td>
                                        <td className="table-cell text-gray-400">
                                            {category.responsible?.name || '-'}
                                        </td>
                                        <td className="table-cell text-gray-400">
                                            {category.company || '-'}
                                        </td>
                                        <td className="table-cell text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(category)}
                                                    className="p-2 text-gray-400 hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-all"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(category.id)}
                                                    disabled={deleting}
                                                    className="p-2 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {categories.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                No categories found. Create your first category.
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={selectedCategory ? 'Edit Category' : 'New Category'}
                size="md"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setShowModal(false)} disabled={saving}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? 'Saving...' : selectedCategory ? 'Save Changes' : 'Create Category'}
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <Input
                        label="Category Name"
                        value={formData.name}
                        onChange={(v) => setFormData({ ...formData, name: v })}
                        placeholder="e.g., Computers"
                        required
                    />
                    <Select
                        label="Responsible Person"
                        value={formData.responsible_user_id}
                        onChange={(v) => setFormData({ ...formData, responsible_user_id: v })}
                        options={users.map((u) => ({ value: u.id.toString(), label: u.name }))}
                        placeholder="Select responsible person"
                    />
                    <Input
                        label="Company"
                        value={formData.company}
                        onChange={(v) => setFormData({ ...formData, company: v })}
                        placeholder="e.g., My Company (San Francisco)"
                    />
                </div>
            </Modal>
        </div>
    );
};

export default EquipmentCategories;
