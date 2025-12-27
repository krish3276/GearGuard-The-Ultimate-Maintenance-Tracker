import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Plus, FolderTree, Loader2, AlertTriangle, Trash2, Edit2, ArrowLeft, Package } from 'lucide-react';
import { Header } from '../components/layout';
import { Card, Button, Badge, Modal, Input, Select, SearchInput } from '../components/common';
import { categoriesAPI, usersAPI, equipmentAPI } from '../services/api';
import { cn } from '../utils/helpers';

const EquipmentCategories = () => {
    const [searchParams] = useSearchParams();
    const highlightId = searchParams.get('highlight');

    const [categories, setCategories] = useState([]);
    const [users, setUsers] = useState([]);
    const [equipmentCounts, setEquipmentCounts] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
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

    useEffect(() => {
        if (highlightId && categories.length > 0) {
            const element = document.getElementById(`category-${highlightId}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [highlightId, categories]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [categoriesRes, usersRes, equipmentRes] = await Promise.all([
                categoriesAPI.getAll(),
                usersAPI.getAll().catch(() => ({ data: [] })),
                equipmentAPI.getAll().catch(() => ({ data: [] })),
            ]);
            const cats = categoriesRes.data?.data || categoriesRes.data || [];
            const equip = equipmentRes.data?.data || equipmentRes.data || [];

            // Count equipment per category
            const counts = {};
            equip.forEach(e => {
                if (e.category_id) {
                    counts[e.category_id] = (counts[e.category_id] || 0) + 1;
                }
            });
            setEquipmentCounts(counts);
            setCategories(cats);
            setUsers(usersRes.data?.data || usersRes.data || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    const filteredCategories = categories.filter(cat =>
        !searchTerm ||
        cat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.company?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                <Header title="Equipment Categories" subtitle="Organize and manage equipment by category" />
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <Header title="Equipment Categories" subtitle="Organize and manage equipment by category" />
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
            <Header title="Equipment Categories" subtitle="Organize and manage equipment by category" />

            <div className="p-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card className="bg-gradient-to-br from-primary-500/10 to-primary-600/5 border-primary-500/20">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary-500/20 rounded-xl">
                                <FolderTree className="w-6 h-6 text-primary-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{categories.length}</p>
                                <p className="text-sm text-gray-400">Total Categories</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-500/20 rounded-xl">
                                <Package className="w-6 h-6 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">
                                    {Object.values(equipmentCounts).reduce((a, b) => a + b, 0)}
                                </p>
                                <p className="text-sm text-gray-400">Categorized Equipment</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-500/20 rounded-xl">
                                <AlertTriangle className="w-6 h-6 text-amber-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">
                                    {categories.filter(c => !equipmentCounts[c.id]).length}
                                </p>
                                <p className="text-sm text-gray-400">Empty Categories</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Toolbar */}
                <Card className="mb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => handleOpenModal()}>
                                New
                            </Button>
                            <span className="text-lg font-semibold text-white">Equipment Categories</span>
                        </div>
                        <SearchInput
                            value={searchTerm}
                            onChange={setSearchTerm}
                            onClear={() => setSearchTerm('')}
                            placeholder="Search categories..."
                            className="w-full md:w-80"
                        />
                    </div>
                </Card>

                {/* Back to Equipment link if highlighted */}
                {highlightId && (
                    <div className="mb-4">
                        <Link
                            to="/equipment"
                            className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Equipment
                        </Link>
                    </div>
                )}

                {/* Categories Table */}
                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-dark-700/50">
                                    <th className="table-header">Name</th>
                                    <th className="table-header">Responsible</th>
                                    <th className="table-header">Company</th>
                                    <th className="table-header text-center">Equipment Count</th>
                                    <th className="table-header text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-dark-700/30">
                                {filteredCategories.map((category) => {
                                    const isHighlighted = highlightId && category.id.toString() === highlightId;
                                    const count = equipmentCounts[category.id] || 0;
                                    return (
                                        <tr
                                            key={category.id}
                                            id={`category-${category.id}`}
                                            className={cn(
                                                "transition-all duration-300",
                                                isHighlighted
                                                    ? "bg-primary-500/20 ring-2 ring-primary-500/50 ring-inset animate-pulse"
                                                    : "hover:bg-glass-white"
                                            )}
                                        >
                                            <td className="table-cell">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "p-2.5 rounded-xl transition-all",
                                                        isHighlighted
                                                            ? "bg-primary-500/40 shadow-glow-sm"
                                                            : "bg-gradient-to-br from-primary-500/20 to-cyan-500/20"
                                                    )}>
                                                        <FolderTree className="w-5 h-5 text-primary-400" />
                                                    </div>
                                                    <div>
                                                        <span className={cn(
                                                            "font-semibold",
                                                            isHighlighted ? "text-white" : "text-gray-200"
                                                        )}>
                                                            {category.name}
                                                        </span>
                                                        {isHighlighted && (
                                                            <Badge variant="info" className="ml-2">Selected</Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="table-cell">
                                                {category.responsible?.name ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white">
                                                            {category.responsible.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="text-gray-300">{category.responsible.name}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-500">Not assigned</span>
                                                )}
                                            </td>
                                            <td className="table-cell">
                                                {category.company ? (
                                                    <span className="text-gray-300">{category.company}</span>
                                                ) : (
                                                    <span className="text-gray-500">-</span>
                                                )}
                                            </td>
                                            <td className="table-cell text-center">
                                                <Badge
                                                    variant={count > 0 ? "success" : "default"}
                                                    className="min-w-[40px]"
                                                >
                                                    {count}
                                                </Badge>
                                            </td>
                                            <td className="table-cell text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => handleOpenModal(category)}
                                                        className="p-2.5 text-gray-400 hover:text-primary-400 hover:bg-primary-500/10 rounded-xl transition-all"
                                                        title="Edit category"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(category.id)}
                                                        disabled={deleting}
                                                        className="p-2.5 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                                                        title="Delete category"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {filteredCategories.length === 0 && (
                            <div className="text-center py-16">
                                <FolderTree className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-400 text-lg mb-2">No categories found</p>
                                <p className="text-gray-500 text-sm mb-6">
                                    {searchTerm ? 'Try a different search term' : 'Create your first category to organize equipment'}
                                </p>
                                {!searchTerm && (
                                    <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => handleOpenModal()}>
                                        Create Category
                                    </Button>
                                )}
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
                        placeholder="e.g., Computers, Monitors, Software"
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
