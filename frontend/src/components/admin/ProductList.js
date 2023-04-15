import { Fragment, useEffect } from "react"
import { Button } from "react-bootstrap"
import { useDispatch, useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { deleteProduct, getAdminProducts } from "../../actions/productActions"
import { clearError, clearProductDeleted } from "../../slices/productSlice"
import Loader from '../layouts/Loader';
import { MDBDataTable} from 'mdbreact';
import {toast } from 'react-toastify'
import Sidebar from "./Sidebar"
import jsPDF from 'jspdf';
import 'jspdf-autotable';


export default function ProductList() {
    const { products = [], loading = true, error }  = useSelector(state => state.productsState)
    const { isProductDeleted, error:productError }  = useSelector(state => state.productState)
    const dispatch = useDispatch();

    const setProducts = () => {
        const data = {
            columns : [
                {
                    label: 'ID',
                    field: 'id',
                    sort: 'asc'
                },
                {
                    label: 'Name',
                    field: 'name',
                    sort: 'asc'
                },
                {
                    label: 'Price',
                    field: 'price',
                    sort: 'asc'
                },
                {
                    label: 'Stock',
                    field: 'stock',
                    sort: 'asc'
                },
                {
                    label: 'Actions',
                    field: 'actions',
                    sort: 'asc'
                }
            ],
            rows : []
        }

        products.forEach( product => {
            data.rows.push({
                id: product._id,
                name: product.name,
                price : `$${product.price}`,
                stock: product.stock,
                actions: (
                    <Fragment>
                        <Link to={`/admin/product/${product._id}`} className="btn btn-primary"> <i className="fa fa-pencil"></i></Link>
                        <Button onClick={e => deleteHandler(e, product._id)} className="btn btn-danger py-1 px-2 ml-2">
                            <i className="fa fa-trash"></i>
                        </Button>
                    </Fragment>
                )
            })
        })

        return data;
    }

    const deleteHandler = (e, id) => {
        e.target.disabled = true;
        dispatch(deleteProduct(id))
    }

    useEffect(() => {
        if(error || productError) {
            toast(error || productError, {
                position: toast.POSITION.BOTTOM_CENTER,
                type: 'error',
                onOpen: ()=> { dispatch(clearError()) }
            })
            return
        }
        if(isProductDeleted) {
            toast('Product Deleted Succesfully!',{
                type: 'success',
                position: toast.POSITION.BOTTOM_CENTER,
                onOpen: () => dispatch(clearProductDeleted())
            })
            return;
        }

        dispatch(getAdminProducts)
    },[dispatch, error, isProductDeleted])
    const exportPDF = () => {
        // Create a new jsPDF instance
        const doc = new jsPDF();
      
        // Add the company name
        doc.setFontSize(18);
        doc.text('SRI VVB ENTERPRISES', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
      
        // Add the company address
        doc.setFontSize(12);
        doc.text('1/218, BTR NAGAR ZUZUVADI', doc.internal.pageSize.getWidth() / 2, 30, { align: 'center' });
        //heading

        doc.setFontSize(12);
        doc.text('PRODUCT LIST', doc.internal.pageSize.getWidth() / 2, 40, { align: 'center' });
      
        // Add the date and time
        const now = new Date();
        const dateTime = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
        doc.setFontSize(10);
        doc.text(dateTime, doc.internal.pageSize.getWidth() - 20, 50, { align: 'right' });
      
        // Add the product list
        const productsData = products.map((product) => [
          product._id,
          product.name,
          `₹${product.price}`,
          product.stock,
        ]);
        doc.autoTable({
          head: [['ID', 'Name', 'Price', 'Stock']],
          body: productsData,
          startY: 70,
          margin: { top: 10 },
        });
      
        // Add the signature
        doc.setFontSize(10);
        doc.text('Signature', doc.internal.pageSize.getWidth() - 20, doc.internal.pageSize.getHeight() - 20, { align: 'right' });
      
        // Save the PDF
        doc.save('product-list.pdf');
      };
      


    return (
        <div className="row">
        <div className="col-12 col-md-2">
                <Sidebar/>
        </div>
        <div className="col-12 col-md-10">
            <h1 className="my-4">Product List</h1>
            <Fragment>
            <Button variant="secondary" className="my-4 mr-4" onClick={exportPDF}>
  Export as PDF
</Button>

                {loading ? <Loader/> : 
                    <MDBDataTable
                        data={setProducts()}
                        bordered
                        striped
                        hover
                        className="px-3"
                    />
                }
            </Fragment>
        </div>
    </div>
    )
}