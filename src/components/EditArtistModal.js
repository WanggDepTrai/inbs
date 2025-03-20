import React, { useState, useEffect } from 'react';
import '../css/ArtistEdit.css';

function EditArtistModal({ artist, onClose, onArtistUpdated }) {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(false);
	const [formData, setFormData] = useState({
		Level: 3,
		YearsOfExperience: 3,
		StoreId: '1975a76e-f637-42d1-bf1b-96edeceb1b9f',
		FullName: '',
		NewImage: null,
		ImageUrl: '',
		PhoneNumber: '',
		DateOfBirth: '',
	});

	// Initialize form data with the selected artist's data
	useEffect(() => {
		if (artist) {
			// Format date to YYYY-MM-DD for input field
			let formattedDate = '';
			if (artist.DateOfBirth) {
				const date = new Date(artist.DateOfBirth);
				formattedDate = date.toISOString().split('T')[0];
			}

			setFormData({
				Level: artist.Level || 3,
				YearsOfExperience: artist.YearsOfExperience || 3,
				StoreId: artist.StoreId || '1975a76e-f637-42d1-bf1b-96edeceb1b9f',
				FullName: artist.FullName || '',
				NewImage: null,
				ImageUrl: artist.ImageUrl || '',
				PhoneNumber: artist.PhoneNumber || '',
				DateOfBirth: formattedDate,
			});
		}
	}, [artist]);

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData({
			...formData,
			[name]: value,
		});
	};

	const handleFileChange = (e) => {
		setFormData({
			...formData,
			NewImage: e.target.files[0],
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			// Create FormData object for the API request
			const apiFormData = new FormData();

			// Add all form fields to the FormData object
			Object.keys(formData).forEach((key) => {
				if (key === 'NewImage' && formData[key]) {
					apiFormData.append(key, formData[key]);
				} else if (formData[key] !== null && formData[key] !== '') {
					apiFormData.append(key, formData[key]);
				}
			});

			// Send PUT request to update the artist
			const response = await fetch(
				`https://inbsapi-d9hhfmhsapgabrcz.southeastasia-01.azurewebsites.net/api/Artist?id=${artist.ID}`,
				{
					method: 'PUT',
					body: apiFormData,
				}
			);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || 'Failed to update artist');
			}

			// Handle successful response
			setSuccess(true);

			// Hide success message after 2 seconds and close modal
			setTimeout(() => {
				setSuccess(false);
				onArtistUpdated(); // Refresh the artist list
				onClose(); // Close the modal
			}, 2000);
		} catch (err) {
			console.error('Error updating artist:', err);
			setError(err.message || 'An error occurred while updating the artist.');
		} finally {
			setLoading(false);
		}
	};

	// Close modal when clicking outside content area
	const handleOutsideClick = (e) => {
		if (e.target.className === 'modal-overlay') {
			onClose();
		}
	};

	return (
		<div className='modal-overlay' onClick={handleOutsideClick}>
			<div className='modal-content'>
				<div className='modal-header'>
					<h2>Edit Artist</h2>
					<button className='close-btn' onClick={onClose}>
						×
					</button>
				</div>

				{success && <div className='success-message'>Artist updated successfully!</div>}
				{error && <div className='error-message'>{error}</div>}

				<form onSubmit={handleSubmit} className='artist-form'>
					<div className='form-group'>
						<label htmlFor='fullName'>Full Name*</label>
						<input
							type='text'
							id='fullName'
							name='FullName'
							value={formData.FullName}
							onChange={handleInputChange}
							required
							placeholder="Enter artist's full name"
						/>
					</div>

					<div className='form-row'>
						<div className='form-group'>
							<label htmlFor='level'>Level*</label>
							<select
								id='level'
								name='Level'
								value={formData.Level}
								onChange={handleInputChange}
								required
							>
								<option value={1}>Level 1</option>
								<option value={2}>Level 2</option>
								<option value={3}>Level 3</option>
								<option value={4}>Level 4</option>
								<option value={5}>Level 5</option>
							</select>
						</div>

						<div className='form-group'>
							<label htmlFor='yearsOfExperience'>Years of Experience*</label>
							<input
								type='number'
								id='yearsOfExperience'
								name='YearsOfExperience'
								value={formData.YearsOfExperience}
								onChange={handleInputChange}
								required
								min='0'
								max='50'
							/>
						</div>
					</div>

					<div className='form-group'>
						<label htmlFor='phoneNumber'>Phone Number*</label>
						<input
							type='tel'
							id='phoneNumber'
							name='PhoneNumber'
							value={formData.PhoneNumber}
							onChange={handleInputChange}
							required
							placeholder='Enter phone number'
						/>
					</div>

					<div className='form-group'>
						<label htmlFor='dateOfBirth'>Date of Birth*</label>
						<input
							type='date'
							id='dateOfBirth'
							name='DateOfBirth'
							value={formData.DateOfBirth}
							onChange={handleInputChange}
							required
						/>
					</div>

					<div className='form-group'>
						<label htmlFor='storeId'>Store ID*</label>
						<input
							type='text'
							id='storeId'
							name='StoreId'
							value={formData.StoreId}
							onChange={handleInputChange}
							required
							placeholder='Store ID'
						/>
					</div>

					<div className='form-group'>
						<label htmlFor='newImage'>Update Profile Image</label>
						<input type='file' id='newImage' name='NewImage' onChange={handleFileChange} accept='image/*' />
					</div>

					<div className='form-group'>
						<label htmlFor='imageUrl'>Image URL (Optional)</label>
						<input
							type='url'
							id='imageUrl'
							name='ImageUrl'
							value={formData.ImageUrl}
							onChange={handleInputChange}
							placeholder='Enter image URL'
						/>
						{formData.ImageUrl && (
							<div className='image-preview'>
								<p>Current image:</p>
								<img
									src={formData.ImageUrl}
									alt='Artist preview'
									style={{ maxWidth: '100px', marginTop: '10px' }}
								/>
							</div>
						)}
					</div>

					<div className='form-actions'>
						<button type='button' className='cancel-btn' onClick={onClose}>
							Cancel
						</button>
						<button type='submit' className='submit-btn' disabled={loading}>
							{loading ? 'Updating Artist...' : 'Update Artist'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

export default EditArtistModal;