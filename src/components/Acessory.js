import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Accessory.css';

function Accessory() {
	const [showSidebar, setShowSidebar] = useState(false);
	const [accessories, setAccessories] = useState([]);
	const [accessoryCount, setAccessoryCount] = useState(0);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
	const [showModal, setShowModal] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState(null);
	const [isEditMode, setIsEditMode] = useState(false);
	const [selectedId, setSelectedId] = useState(null);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [accessoryToDelete, setAccessoryToDelete] = useState(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const [deleteError, setDeleteError] = useState(null);

	const [newItem, setNewItem] = useState({
		Name: '',
		Price: '',
		NewImage: '',
		ImageUrl: '',
	});

	const navigate = useNavigate();

	useEffect(() => {
		fetchAccessories();
		fetchAccessoryCount();
	}, []);

	const fetchAccessories = async () => {
		try {
			setLoading(true);
			const response = await fetch(
				'https://inbsapi-d9hhfmhsapgabrcz.southeastasia-01.azurewebsites.net/odata/Accessory'
			);

			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}

			const data = await response.json();
			setAccessories(data.value || []);
			setLoading(false);
		} catch (err) {
			setError(err.message);
			setLoading(false);
		}
	};

	const fetchAccessoryCount = async () => {
		try {
			const response = await fetch(
				'https://inbsapi-d9hhfmhsapgabrcz.southeastasia-01.azurewebsites.net/odata/Accessory/$count'
			);

			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}

			const count = await response.text();
			setAccessoryCount(parseInt(count, 10));
		} catch (err) {
			console.error('Error fetching accessory count:', err);
			// Not setting main error state to avoid interfering with the table display
		}
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setNewItem((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSearchChange = (e) => {
		setSearchTerm(e.target.value);
	};

	const requestSort = (key) => {
		let direction = 'ascending';
		if (sortConfig.key === key && sortConfig.direction === 'ascending') {
			direction = 'descending';
		}
		setSortConfig({ key, direction });
	};

	const getFilteredAccessories = () => {
		const filtered = accessories.filter(
			(item) =>
				item.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				item.Description?.toLowerCase().includes(searchTerm.toLowerCase())
		);

		if (sortConfig.key) {
			return [...filtered].sort((a, b) => {
				if (a[sortConfig.key] < b[sortConfig.key]) {
					return sortConfig.direction === 'ascending' ? -1 : 1;
				}
				if (a[sortConfig.key] > b[sortConfig.key]) {
					return sortConfig.direction === 'ascending' ? 1 : -1;
				}
				return 0;
			});
		}
		return filtered;
	};

	const openCreateModal = () => {
		setNewItem({
			Name: '',
			Price: '',
			NewImage: '',
			ImageUrl: '',
		});
		setSubmitError(null);
		setIsEditMode(false);
		setSelectedId(null);
		setShowModal(true);
	};

	const openEditModal = (item) => {
		setNewItem({
			Name: item.Name,
			Price: item.Price.toString(),
			NewImage: '',
			ImageUrl: item.ImageUrl || '',
		});
		setSubmitError(null);
		setIsEditMode(true);
		setSelectedId(item.ID);
		setShowModal(true);
	};

	const closeModal = () => {
		setShowModal(false);
		setSubmitError(null);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		// Validation
		if (!newItem.Name || !newItem.Price) {
			setSubmitError('Name and Price are required fields');
			return;
		}

		try {
			setIsSubmitting(true);
			setSubmitError(null);

			const formData = new FormData();
			formData.append('Name', newItem.Name);
			formData.append('Price', newItem.Price);

			if (newItem.NewImage) {
				formData.append('NewImage', newItem.NewImage);
			}

			if (newItem.ImageUrl) {
				formData.append('ImageUrl', newItem.ImageUrl);
			}

			let url = 'https://inbsapi-d9hhfmhsapgabrcz.southeastasia-01.azurewebsites.net/api/Accessory';
			let method = 'POST';

			// If in edit mode, update the URL and method
			if (isEditMode && selectedId) {
				url = `https://inbsapi-d9hhfmhsapgabrcz.southeastasia-01.azurewebsites.net/api/Accessory?id=${selectedId}`;
				method = 'PUT';
			}

			const response = await fetch(url, {
				method: method,
				body: formData,
			});

			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}

			// Success
			setShowModal(false);
			fetchAccessories(); // Refresh the list
			fetchAccessoryCount(); // Update the count
		} catch (err) {
			setSubmitError(err.message);
			console.error('Error saving accessory:', err);
		} finally {
			setIsSubmitting(false);
		}
	};

	const openDeleteModal = (item) => {
		setAccessoryToDelete(item);
		setDeleteError(null);
		setShowDeleteModal(true);
	};

	const closeDeleteModal = () => {
		setShowDeleteModal(false);
		setDeleteError(null);
	};

	const handleDeleteAccessory = async () => {
		if (!accessoryToDelete) return;

		try {
			setIsDeleting(true);
			setDeleteError(null);

			// Update to match the exact DELETE endpoint format shown in the screenshot
			const response = await fetch(
				`https://inbsapi-d9hhfmhsapgabrcz.southeastasia-01.azurewebsites.net/api/Accessory?id=${accessoryToDelete.ID}`,
				{
					method: 'DELETE',
				}
			);

			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}

			// Success
			setShowDeleteModal(false);
			fetchAccessories(); // Refresh the list
			fetchAccessoryCount(); // Update the count
		} catch (err) {
			setDeleteError(err.message);
			console.error('Error deleting accessory:', err);
		} finally {
			setIsDeleting(false);
		}
	};

	const handleLogout = () => navigate('/');
	const handleHome = () => navigate('/home');
	const handleArtist = () => navigate('/artist');
	const handleWaitlist = () => navigate('/waitlist');

	return (
		<div className='store-container'>
			{/* Sidebar */}
			<div
				className={`sidebar ${showSidebar ? 'expanded' : ''}`}
				onMouseEnter={() => setShowSidebar(true)}
				onMouseLeave={() => setShowSidebar(false)}
			>
				<div className='logo-container'>
					<h1 className='logo'>{showSidebar ? 'INBS' : 'IB'}</h1>
				</div>

				<div className='sidebar-buttons'>
					<button className='sidebar-button' onClick={handleHome}>
						<span
							className='button-icon'
							style={{ marginRight: '12px', marginLeft: '-12px', fontSize: '20px' }}
						>
							🏠
						</span>
						{showSidebar && 'Home'}
					</button>

					<button className='sidebar-button' onClick={handleArtist}>
						<span
							className='button-icon'
							style={{ marginRight: '12px', marginLeft: '-12px', fontSize: '20px' }}
						>
							🎨
						</span>
						{showSidebar && 'Artist'}
					</button>

					<button className='sidebar-button' onClick={handleWaitlist}>
						<span
							className='button-icon'
							style={{ marginRight: '12px', marginLeft: '-12px', fontSize: '20px' }}
						>
							⏳
						</span>
						{showSidebar && 'Waitlist'}
					</button>

					<button className='sidebar-button' onClick={handleLogout}>
						<span
							className='button-icon'
							style={{ marginRight: '12px', marginLeft: '-12px', fontSize: '20px' }}
						>
							⬅️
						</span>
						{showSidebar && 'Logout'}
					</button>
				</div>
			</div>

			{/* Main Content */}
			<div className={`main-content ${showSidebar ? 'sidebar-expanded' : ''}`}>
				<div className='header'>
					<h1 className='page-title'>Accessory</h1>
					<div className='stats-container'>
						<div className='stat-card'>
							<div className='stat-title'>Total Accessories</div>
							<div className='stat-value'>{accessoryCount}</div>
						</div>
					</div>
				</div>

				<div className='table-controls'>
					<div className='search-container'>
						<input
							type='text'
							placeholder='Search accessories...'
							value={searchTerm}
							onChange={handleSearchChange}
							className='search-input'
						/>
						<span className='search-icon'>🔍</span>
					</div>
					<div className='button-group'>
						<button className='add-button' onClick={openCreateModal}>
							✚ Add New
						</button>
						<button className='refresh-button' onClick={fetchAccessories}>
							🔄 Refresh
						</button>
					</div>
				</div>

				{loading ? (
					<div className='loading-container'>
						<div className='loader'></div>
						<p>Loading accessories...</p>
					</div>
				) : error ? (
					<div className='error-message'>
						<p>Error: {error}</p>
						<button onClick={fetchAccessories} className='retry-button'>
							Try Again
						</button>
					</div>
				) : (
					<div className='table-responsive'>
						<table className='accessories-table'>
							<thead>
								<tr>
									<th onClick={() => requestSort('ID')}>
										ID{' '}
										{sortConfig.key === 'ID' && (
											<span>{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
										)}
									</th>
									<th onClick={() => requestSort('Name')}>
										Name{' '}
										{sortConfig.key === 'Name' && (
											<span>{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
										)}
									</th>
									<th onClick={() => requestSort('Price')}>
										Price{' '}
										{sortConfig.key === 'Price' && (
											<span>{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
										)}
									</th>
									<th onClick={() => requestSort('Category')}>
										Category{' '}
										{sortConfig.key === 'Category' && (
											<span>{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
										)}
									</th>
									<th onClick={() => requestSort('Duration')}>
										Duration{' '}
										{sortConfig.key === 'Duration' && (
											<span>{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
										)}
									</th>
									<th>Description</th>
									<th>Image</th>
									<th onClick={() => requestSort('CreatedAt')}>
										Created At{' '}
										{sortConfig.key === 'CreatedAt' && (
											<span>{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
										)}
									</th>
									<th onClick={() => requestSort('LastModifiedAt')}>
										Last Modified{' '}
										{sortConfig.key === 'LastModifiedAt' && (
											<span>{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
										)}
									</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{getFilteredAccessories().length > 0 ? (
									getFilteredAccessories().map((item) => (
										<tr key={item.ID}>
											<td>{item.ID}</td>
											<td>{item.Name}</td>
											<td>${item.Price}</td>
											<td>{item.Category || 'N/A'}</td>
											<td>{item.Duration || 'N/A'}</td>
											<td className='description-cell'>
												<div className='truncate-text'>
													{item.Description || 'No description'}
												</div>
											</td>
											<td>
												{item.ImageUrl ? (
													<img
														src={item.ImageUrl}
														alt={item.Name}
														className='accessory-image'
														onError={(e) => {
															e.target.onerror = null;
															e.target.src = 'https://via.placeholder.com/50';
														}}
													/>
												) : (
													<span>No image</span>
												)}
											</td>
											<td>{new Date(item.CreatedAt).toLocaleString()}</td>
											<td>{new Date(item.LastModifiedAt).toLocaleString()}</td>
											<td>
												<div className='action-buttons'>
													<button className='edit-button' onClick={() => openEditModal(item)}>
														Edit
													</button>
													<button
														className='delete-button'
														onClick={() => openDeleteModal(item)}
													>
														Delete
													</button>
												</div>
											</td>
										</tr>
									))
								) : (
									<tr>
										<td colSpan='10' className='no-data'>
											No accessories found
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				)}
			</div>

			{/* Create/Edit Accessory Modal */}
			{showModal && (
				<div className='modal-overlay'>
					<div className='modal-content'>
						<div className='modal-header'>
							<h2>{isEditMode ? 'Edit Accessory' : 'Add New Accessory'}</h2>
							<button className='close-button' onClick={closeModal}>
								&times;
							</button>
						</div>
						<form onSubmit={handleSubmit}>
							<div className='form-group'>
								<label htmlFor='Name'>Name *</label>
								<input
									type='text'
									id='Name'
									name='Name'
									value={newItem.Name}
									onChange={handleInputChange}
									required
								/>
							</div>
							<div className='form-group'>
								<label htmlFor='Price'>Price *</label>
								<input
									type='number'
									id='Price'
									name='Price'
									value={newItem.Price}
									onChange={handleInputChange}
									required
								/>
							</div>
							<div className='form-group'>
								<label htmlFor='NewImage'>Image (File Name)</label>
								<input
									type='text'
									id='NewImage'
									name='NewImage'
									value={newItem.NewImage}
									onChange={handleInputChange}
								/>
							</div>
							<div className='form-group'>
								<label htmlFor='ImageUrl'>Image URL</label>
								<input
									type='text'
									id='ImageUrl'
									name='ImageUrl'
									value={newItem.ImageUrl}
									onChange={handleInputChange}
								/>
							</div>

							{submitError && (
								<div className='error-message'>
									<p>{submitError}</p>
								</div>
							)}

							<div className='form-actions'>
								<button type='button' className='cancel-button' onClick={closeModal}>
									Cancel
								</button>
								<button type='submit' className='submit-button' disabled={isSubmitting}>
									{isSubmitting ? 'Saving...' : isEditMode ? 'Update Accessory' : 'Save Accessory'}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Delete Confirmation Modal */}
			{showDeleteModal && accessoryToDelete && (
				<div className='modal-overlay'>
					<div className='modal-content delete-modal'>
						<div className='modal-header'>
							<h2>Confirm Deletion</h2>
							<button className='close-button' onClick={closeDeleteModal}>
								&times;
							</button>
						</div>
						<div className='modal-body'>
							<p>
								Are you sure you want to delete the accessory "<strong>{accessoryToDelete.Name}</strong>
								"?
							</p>
							<p className='warning-text'>This action cannot be undone.</p>

							{deleteError && (
								<div className='error-message'>
									<p>{deleteError}</p>
								</div>
							)}
						</div>
						<div className='form-actions'>
							<button type='button' className='cancel-button' onClick={closeDeleteModal}>
								Cancel
							</button>
							<button
								type='button'
								className='delete-confirm-button'
								disabled={isDeleting}
								onClick={handleDeleteAccessory}
							>
								{isDeleting ? 'Deleting...' : 'Delete Accessory'}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default Accessory;